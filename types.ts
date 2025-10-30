// types.ts

export interface Patient {
  id: string;
  // Section I: Hành chính
  name: string; // 1. Họ và tên
  dob: string; // 2. Sinh ngày
  sex: 'Nam' | 'Nữ' | 'Khác'; // 3. Giới
  occupation?: string; // 4. Nghề nghiệp
  ethnicity?: string; // 5. Dân tộc
  nationality?: string; // 6. Ngoại kiều
  address?: string; // 7. Địa chỉ
  workplace?: string; // 8. Nơi làm việc
  subjectType?: 'BHYT' | 'Dịch vụ' | 'Khác'; // 9. Đối tượng
  bhytNumber?: string; // 10. Số thẻ BHYT
  bhytExpiry?: string; // 10. BHYT giá trị đến ngày
  emergencyContact?: string; // 11. Thông tin liên lạc
  emergencyContactPhone?: string; // 11. Điện thoại số

  // Section II. Hỏi bệnh (Tiền sử)
  pastMedicalHistory?: string; // Tiền sử bản thân
  familyHistory?: string; // Tiền sử gia đình
  allergies?: string; // Dị ứng
  habits?: string; // Rượu bia, thuốc lá, etc.

  // Old fields for compatibility
  phone?: string;
  department?: string;
}

export interface ScoreResult {
  [scoreName: string]: number;
}

export interface RankedDiagnosis {
  dx: string;
  priority: 'Cao' | 'TB' | 'Thấp';
  triage: 'Cấp cứu' | 'Ưu tiên' | 'Không cấp cứu';
  department: string;
}

export interface ClsResult {
  [testName: string]: string | number;
}

export interface ImageAnalysisResult {
    id: string;
    name: string;
    base64Data: string;
    mimeType: string;
    aiAnalysis: string;
}

export interface Treatment {
    name: string;
    dose: string;
    frequency: string;
    route: string;
}

export interface PhysicalExam {
    general?: string;
    cardiovascular?: string;
    respiratory?: string;
    gastrointestinal?: string;
    genitourinary?: string;
    neurological?: string;
    musculoskeletal?: string;
    ent?: string; // Tai-Mũi-Họng
    dental?: string; // Răng-Hàm-Mặt
    eyes?: string;
    endocrineNutritional?: string;
}

export interface DiagnosisDetails {
  keyFeatures: string[];
  diagnosticTests: string[];
  treatmentOverview: string;
}

// --- NEW Clinical Decision Support Types ---

export interface RedFlag {
  message: string;
  action: string;
}

export interface Differential {
  dx: string;
  likelihood: number; // 0 to 1
  rationale: string;
  icd_code?: string;
}

export interface RecommendedTest {
  test: string;
  reason: string;
  priority: 'STAT' | 'SOON' | 'ROUTINE';
}

export interface Antibiotic {
  name: string;
  dose: string;
  route: string;
  frequency: string;
  duration?: string;
  adjustments?: {
    eGFR: string;
    adjusted_dose: string;
  };
}

export interface AntibioticPlan {
  regimen: Antibiotic[];
  notes?: string;
  warnings?: string[];
}

export interface SoapNote {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

export interface ClinicalDecisionSupport {
  red_flags: RedFlag[];
  triage_action?: string;
  differentials: Differential[];
  recommended_tests: RecommendedTest[];
  scores?: {
    [key: string]: {
      score: number;
      interpretation: string;
    };
  };
  spo2_target?: string;
  antibiotic_plan?: AntibioticPlan;
  soap_note: SoapNote;
  legal_notice: string;
}


// Cấu trúc dữ liệu chính cho một lần khám bệnh
export interface Encounter {
  id: string;
  patientId: string;
  createdAt: string; 
  
  // Section II. Quản lý người bệnh
  admissionTime?: string; // 12. Vào viện
  admissionDepartment?: 'Cấp cứu' | 'KKB' | 'Khoa điều trị'; // 13. Trực tiếp vào
  referralSource?: 'Cơ quan y tế' | 'Tự đến' | 'Khác'; // 14. Nơi giới thiệu
  admissionCountForDisease?: number; // 14. Vào viện do bệnh này lần thứ
  departmentAdmissionTime?: string; // 15. Vào khoa
  transfers?: { toDepartment: string; time: string }[]; // 16. Chuyển Khoa
  hospitalTransferType?: 'Tuyến trên' | 'Tuyến dưới' | 'CK'; // 17. Chuyển viện
  transferToHospital?: string; // 17. Chuyển đến
  dischargeTime?: string; // 18. Ra viện
  dischargeStatus?: 'Ra viện' | 'Xin về' | 'Bỏ về' | 'Đưa về'; // 18. Hình thức ra viện
  totalTreatmentDays?: number; // 19. Tổng số ngày điều trị

  // Section I & II from Page 2: Hỏi bệnh
  reasonForAdmission?: string; // I. Lý do vào viện
  dayOfIllness?: number; // I. Vào ngày thứ của bệnh
  historyOfPresentIllness?: string; // II.1. Quá trình bệnh lý

  // Tab 2 - Old symptoms section, keep for compatibility
  symptoms: {
    system: string;
    main: string;
    secondary: string[];
  };
  scores: ScoreResult;
  risk?: string;
  
  // III. Khám bệnh (Page 2)
  physicalExam?: PhysicalExam;
  summary?: string; // Tóm tắt bệnh án

  // Section III. Chẩn đoán
  referralDiagnosis?: string; // 20. Chẩn đoán nơi chuyển đến
  emergencyRoomDiagnosis?: string; // 21. Chẩn đoán KKB, Cấp cứu
  admissionDiagnosis?: string; // 22. Chẩn đoán khi vào khoa điều trị
  procedures?: string; // 22. Thủ thuật
  
  comorbidities?: string; // 23. Bệnh kèm theo
  complications?: string; // 23. Tai biến / Biến chứng
  
  differentialDiagnosis?: string; // IV. Phân biệt (Page 2)
  prognosis?: string; // V. Tiên lượng (Page 2)
  treatmentDirection?: string; // VI. Hướng điều trị (Page 2)
  
  // Tab 3 - Deprecated, replaced by cds_results
  dx_ranked?: RankedDiagnosis[];
  dx_selected?: RankedDiagnosis;
  ai_comment?: string;

  // Tab 4
  cls_results?: ClsResult;
  image_results?: ImageAnalysisResult[];
  dx_final?: string; // This is 'Bệnh chính' on discharge (23)
  doctor_advice?: string;

  // Tab 5 - Deprecated, replaced by cds_results
  treatment_plan?: {
    main: Treatment[];
    support?: Treatment[];
    monitor: string[];
    recommendation: string;
  };

  // NEW: All AI results in one object
  cds_results?: ClinicalDecisionSupport;

  // Section IV. Tình trạng ra viện
  treatmentResult?: 'Khỏi' | 'Đỡ, giảm' | 'Không thay đổi' | 'Nặng hơn' | 'Tử vong'; // 24. Kết quả
  pathologyResult?: string; // 25. Giải phẫu bệnh
  pathologyFinding?: 'Lành tính' | 'Nghi ngờ' | 'Ác tính'; // 25.
  deathTime?: string; // 26. Tình hình tử vong
  causeOfDeathCategory?: 'Do bệnh' | 'Do tai biến điều trị' | 'Khác'; // 26.
  deathTiming?: 'Trong 24 giờ' | 'Sau 24 giờ'; // 26.
  primaryCauseOfDeath?: string; // 27. Nguyên nhân chính
  autopsyPerformed?: boolean; // 28. Khám nghiệm tử thi
  autopsyDiagnosis?: string; // 29. Chẩn đoán giải phẫu tử thi
}

// Dữ liệu tổng hợp cho Dashboard
export interface PatientRecord {
    patient: Patient;
    encounters: Encounter[];
    alerts?: string[];
    recommendations?: string[];
}