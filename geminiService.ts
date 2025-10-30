// services/geminiService.ts
import { GoogleGenAI, Type } from "@google/genai";
import type { DiagnosisDetails, Encounter, Patient, ClinicalDecisionSupport } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to ensure API key is set
const checkApiKey = () => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }
};

/**
 * Cung cấp gói hỗ trợ quyết định lâm sàng toàn diện từ AI
 */
export async function getClinicalDecisionSupport(patient: Patient, encounter: Encounter): Promise<ClinicalDecisionSupport> {
  checkApiKey();
  const age = patient.dob ? new Date().getFullYear() - new Date(patient.dob).getFullYear() : 'Không rõ';
  const promptContext = `
    Dựa trên thông tin ca bệnh được cung cấp, hãy đưa ra một gói hỗ trợ quyết định lâm sàng toàn diện.

    Thông tin bệnh nhân:
    - Tuổi: ${age}
    - Giới: ${patient.sex}
    - Tiền sử: ${patient.pastMedicalHistory || 'Chưa ghi nhận'}
    - Dị ứng: ${patient.allergies || 'Chưa ghi nhận'}

    Thông tin lâm sàng lần khám này:
    - Lý do vào viện: ${encounter.reasonForAdmission}
    - Bệnh sử: ${encounter.historyOfPresentIllness}
    - Khám thực thể tóm tắt: ${encounter.summary}
    - Hệ cơ quan chính: ${encounter.symptoms.system}
    - Triệu chứng chính: ${encounter.symptoms.main}
    - Điểm thang đo đã tính: ${JSON.stringify(encounter.scores)}
    - Mức độ nguy cơ từ thang điểm: ${encounter.risk || 'Chưa xác định'}
    - Kết quả CLS đã có (nếu có): ${JSON.stringify(encounter.cls_results)}
  `;

  const systemInstruction = `
    Bạn là một trợ lý y tế AI chuyên về hỗ trợ quyết định lâm sàng (CDS) tại khoa cấp cứu.
    Nhiệm vụ của bạn là phân tích dữ liệu bệnh nhân và cung cấp các gợi ý dựa trên bằng chứng để hỗ trợ bác sĩ.
    ƯU TIÊN HÀNG ĐẦU LÀ AN TOÀN BỆNH NHÂN.

    QUY TRÌNH LÀM VIỆC:
    1.  **Kiểm tra Cảnh báo (Red Flags):** Luôn luôn xác định các dấu hiệu nguy hiểm cần xử trí ngay lập tức.
    2.  **Xây dựng Chẩn đoán phân biệt:** Đưa ra 3-5 chẩn đoán có khả năng nhất, kèm theo điểm tin cậy (likelihood), lý do (rationale), và mã ICD-10 tương ứng.
    3.  **Gợi ý Cận lâm sàng:** Đề xuất các xét nghiệm cần thiết, phân loại theo mức độ khẩn cấp (STAT, SOON, ROUTINE).
    4.  **Tính toán Thang điểm:** Xác nhận và diễn giải các thang điểm lâm sàng (ví dụ: qSOFA, CURB-65).
    5.  **Mục tiêu Điều trị:** Đề xuất mục tiêu SpO2, đặc biệt ở bệnh nhân có nguy cơ tăng CO2.
    6.  **Kế hoạch Kháng sinh:** Nếu có nhiễm trùng, gợi ý phác đồ kháng sinh theo kinh nghiệm, kèm theo cảnh báo và lưu ý chỉnh liều theo eGFR (giả định eGFR > 60 ml/phút nếu không có thông tin).
    7.  **Tạo SOAP Note:** Tóm tắt toàn bộ quá trình thành một ghi chú SOAP (Subjective, Objective, Assessment, Plan) súc tích.
    8.  **Tuyên bố Miễn trừ trách nhiệm:** Luôn kết thúc bằng một tuyên bố pháp lý.

    Hãy tuân thủ nghiêm ngặt cấu trúc JSON được yêu cầu. Không thêm bất kỳ văn bản nào ngoài đối tượng JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: promptContext,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            red_flags: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  message: { type: Type.STRING, description: 'Mô tả cảnh báo' },
                  action: { type: Type.STRING, description: 'Hành động gợi ý' },
                },
                required: ['message', 'action'],
              },
            },
            triage_action: { type: Type.STRING, description: 'Hành động cấp cứu tổng thể' },
            differentials: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  dx: { type: Type.STRING, description: 'Tên chẩn đoán' },
                  likelihood: { type: Type.NUMBER, description: 'Độ tin cậy từ 0.0 đến 1.0' },
                  rationale: { type: Type.STRING, description: 'Lý do ngắn gọn' },
                  icd_code: { type: Type.STRING, description: 'Mã ICD-10 tương ứng nếu có' },
                },
                required: ['dx', 'likelihood', 'rationale'],
              },
            },
            recommended_tests: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  test: { type: Type.STRING },
                  reason: { type: Type.STRING },
                  priority: { type: Type.STRING, enum: ['STAT', 'SOON', 'ROUTINE'] },
                },
                required: ['test', 'reason', 'priority'],
              },
            },
            spo2_target: { type: Type.STRING, description: 'Mục tiêu SpO2, vd: 92-96% hoặc 88-92%' },
            antibiotic_plan: {
              type: Type.OBJECT,
              properties: {
                regimen: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING }, dose: { type: Type.STRING }, route: { type: Type.STRING }, frequency: { type: Type.STRING }, duration: { type: Type.STRING },
                      adjustments: {
                        type: Type.OBJECT,
                        properties: { eGFR: { type: Type.STRING }, adjusted_dose: { type: Type.STRING } }
                      }
                    },
                    required: ['name', 'dose', 'route', 'frequency']
                  }
                },
                notes: { type: Type.STRING },
                warnings: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
            },
            soap_note: {
              type: Type.OBJECT,
              properties: {
                subjective: { type: Type.STRING }, objective: { type: Type.STRING }, assessment: { type: Type.STRING }, plan: { type: Type.STRING },
              },
              required: ['subjective', 'objective', 'assessment', 'plan'],
            },
            legal_notice: { type: Type.STRING },
          },
          required: ['red_flags', 'differentials', 'recommended_tests', 'soap_note', 'legal_notice'],
        },
        temperature: 0.3,
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Lỗi khi lấy Gói Hỗ trợ Quyết định Lâm sàng từ AI:", error);
    throw new Error("Không thể nhận phản hồi từ AI. Vui lòng thử lại.");
  }
}

/**
 * Lấy chẩn đoán xác định từ AI sau khi có kết quả CLS
 */
export async function getRefinedDiagnosis(patient: Patient, encounter: Encounter): Promise<string> {
  checkApiKey();
  const age = patient.dob ? new Date().getFullYear() - new Date(patient.dob).getFullYear() : 'Không rõ';

  const promptContext = `
    Dựa trên toàn bộ thông tin ca bệnh, đặc biệt là kết quả cận lâm sàng vừa có, hãy đưa ra chẩn đoán xác định cuối cùng.

    Thông tin bệnh nhân:
    - Tuổi: ${age}
    - Giới: ${patient.sex}
    - Tiền sử: ${patient.pastMedicalHistory || 'Chưa ghi nhận'}

    Thông tin lâm sàng lần khám này:
    - Bệnh sử và khám lâm sàng: ${encounter.summary || encounter.historyOfPresentIllness}
    - Các chẩn đoán phân biệt ban đầu (do AI gợi ý): ${encounter.cds_results?.differentials.map(d => d.dx).join(', ') || 'Không có'}
    - Chẩn đoán sơ bộ (do bác sĩ chọn): ${encounter.dx_final || 'Chưa chọn'}
    
    **KẾT QUẢ CẬN LÂM SÀNG MỚI NHẤT:**
    ${JSON.stringify(encounter.cls_results, null, 2)}

    YÊU CẦU:
    Chỉ trả lời bằng MỘT chẩn đoán xác định duy nhất, ngắn gọn và chính xác nhất.
    Ví dụ: "Viêm phổi thùy do phế cầu (J13)" hoặc "Đợt cấp mất bù suy tim EF giảm".
    Không thêm bất kỳ lời giải thích hay câu chữ nào khác.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: promptContext,
      config: { temperature: 0.1 }
    });
    return response.text.trim();
  } catch (error) {
    console.error("Lỗi khi lấy chẩn đoán xác định từ AI:", error);
    return encounter.dx_final || "Lỗi: Không thể nhận chẩn đoán từ AI.";
  }
}


/**
 * Lấy thông tin chi tiết về một chẩn đoán cụ thể (giống BMJ Best Practice)
 */
export async function getDiagnosisDetails(diagnosisName: string): Promise<DiagnosisDetails> {
  checkApiKey();
  const promptContext = `
    Bạn là một trợ lý y tế AI chuyên cung cấp thông tin lâm sàng súc tích.
    Đối với chẩn đoán sau: "${diagnosisName}", hãy cung cấp thông tin chi tiết theo cấu trúc JSON.

    Yêu cầu:
    1.  'keyFeatures': Cung cấp một mảng các triệu chứng và dấu hiệu lâm sàng chính (từ 3-5 gạch đầu dòng).
    2.  'diagnosticTests': Cung cấp một mảng các xét nghiệm cận lâm sàng quan trọng để chẩn đoán (từ 3-5 gạch đầu dòng).
    3.  'treatmentOverview': Cung cấp một đoạn văn ngắn (2-3 câu) tóm tắt hướng điều trị chính.
    4.  Chỉ trả về một đối tượng JSON hợp lệ. Không thêm bất kỳ văn bản nào khác.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: promptContext,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            keyFeatures: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            diagnosticTests: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            treatmentOverview: { type: Type.STRING },
          },
          required: ['keyFeatures', 'diagnosticTests', 'treatmentOverview'],
        },
        temperature: 0.2,
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết chẩn đoán từ AI:", error);
    return { keyFeatures: [], diagnosticTests: [], treatmentOverview: "Lỗi khi tải thông tin." };
  }
}


/**
 * Phân tích hình ảnh y tế
 */
export async function analyzeImage(base64Data: string, mimeType: string): Promise<string> {
    checkApiKey();
    const imagePart = { inlineData: { mimeType, data: base64Data } };
    const textPart = { text: "Phân tích hình ảnh y tế này. Mô tả các phát hiện chính và đưa ra kết luận sơ bộ. Phản hồi bằng tiếng Việt." };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
        });
        return response.text;
    } catch (error) {
        console.error("Lỗi khi phân tích hình ảnh:", error);
        return "Không thể phân tích hình ảnh.";
    }
}

/**
 * Tạo tóm tắt bệnh án từ AI
 */
// FIX: Completed the getCaseSummary function which was previously corrupted and incomplete.
// This resolves multiple syntax errors and ensures the function returns a value as promised.
export async function getCaseSummary(patient: Patient, encounter: Encounter): Promise<string> {
  checkApiKey();
  const age = patient.dob ? new Date().getFullYear() - new Date(patient.dob).getFullYear() : 'Không rõ';

  const physicalExamSummary = encounter.physicalExam 
    ? Object.entries(encounter.physicalExam)
        .filter(([, value]) => value) // Filter out empty findings
        .map(([key, value]) => `- ${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`)
        .join('\n')
    : 'Chưa khám';
    
  const promptContext = `
    Bạn là một trợ lý y tế AI có nhiệm vụ tóm tắt bệnh án.
    Dựa trên thông tin dưới đây, hãy viết một đoạn tóm tắt bệnh án súc tích, mạch lạc theo văn phong y khoa.
    Đoạn tóm tắt nên bao gồm các phần chính: hành chính, lý do vào viện, bệnh sử, tiền sử, khám lâm sàng và các dấu hiệu bất thường.

    Thông tin bệnh nhân:
    - Tuổi: ${age}
    - Giới: ${patient.sex}
    - Tiền sử: ${patient.pastMedicalHistory || 'Chưa ghi nhận'}
    - Dị ứng: ${patient.allergies || 'Chưa ghi nhận'}

    Thông tin lâm sàng lần khám này:
    - Lý do vào viện: ${encounter.reasonForAdmission}
    - Bệnh sử: ${encounter.historyOfPresentIllness}
    - Khám thực thể:
${physicalExamSummary}
    - Triệu chứng chính: ${encounter.symptoms.main}
    - Các thang điểm đã tính: ${JSON.stringify(encounter.scores)}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: promptContext,
      config: {
        temperature: 0.3,
      }
    });
    return response.text.trim();
  } catch (error) {
    console.error("Lỗi khi tạo tóm tắt bệnh án từ AI:", error);
    throw new Error("Không thể tạo tóm tắt từ AI. Vui lòng thử lại.");
  }
}
