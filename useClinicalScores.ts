// components/hooks/useClinicalScores.ts
import { useMemo } from 'react';
import type { ScoreResult, Patient } from '../../types';

// --- Định nghĩa các thang điểm và tiêu chí ---

export const CURB65_CRITERIA = {
  C: 'Lú lẫn (Confusion)',
  U: 'Ure > 7 mmol/L',
  R: 'Nhịp thở (Respiratory rate) ≥ 30 lần/phút',
  B: 'Huyết áp (Blood pressure) thấp (SBP < 90 hoặc DBP ≤ 60)',
  '65': 'Tuổi (Age) ≥ 65',
};

export const QSOFA_CRITERIA = {
  R: 'Nhịp thở (Respiratory rate) ≥ 22 lần/phút',
  A: 'Thay đổi tri giác (Altered mentation)',
  S: 'Huyết áp tâm thu (Systolic BP) ≤ 100 mmHg',
};

export const CHADSVASC_CRITERIA = {
  C: { label: 'Suy tim sung huyết (Congestive heart failure)', points: 1 },
  H: { label: 'Tăng huyết áp (Hypertension)', points: 1 },
  A2: { label: 'Tuổi (Age) ≥ 75', points: 2 },
  D: { label: 'Đái tháo đường (Diabetes)', points: 1 },
  S2: { label: 'Tiền sử Đột quỵ/TIA (Stroke)', points: 2 },
  V: { label: 'Bệnh lý mạch máu (Vascular disease)', points: 1 },
  A1: { label: 'Tuổi (Age) 65-74', points: 1 },
  Sc: { label: 'Giới nữ (Sex category)', points: 1 },
};

const CHADSVASC_RISK_MAP: { [key: number]: string } = {
  0: '0.0', 1: '1.3', 2: '2.2', 3: '3.2', 4: '4.0', 5: '6.7', 6: '9.8', 7: '9.6', 8: '12.5', 9: '15.2',
};

export const ALVARADO_CRITERIA = {
  M: { label: 'Đau di chuyển hố chậu phải (Migratory pain)', points: 1, group: 'Symptom' },
  A: { label: 'Chán ăn (Anorexia)', points: 1, group: 'Symptom' },
  N: { label: 'Buồn nôn/Nôn (Nausea/Vomiting)', points: 1, group: 'Symptom' },
  T: { label: 'Ấn đau hố chậu phải (Tenderness)', points: 2, group: 'Sign' },
  R: { label: 'Dấu hiệu cảm ứng phúc mạc (Rebound tenderness)', points: 1, group: 'Sign' },
  E: { label: 'Sốt > 37.3°C (Elevated temperature)', points: 1, group: 'Sign' },
  L: { label: 'Bạch cầu > 10,000/mm³ (Leukocytosis)', points: 2, group: 'Lab' },
  S: { label: 'Chuyển trái (Shift to the left)', points: 1, group: 'Lab' },
};

export const ABCD2_CRITERIA = {
  A: { label: 'Tuổi (Age) ≥ 60', points: 1 },
  B: { label: 'Huyết áp (BP) ≥ 140/90 mmHg', points: 1 },
  C: {
    label: 'Đặc điểm lâm sàng (Clinical features)',
    options: [
      { value: 'weakness', label: 'Yếu liệt một bên', points: 2 },
      { value: 'speech', label: 'Rối loạn ngôn ngữ đơn thuần', points: 1 },
      { value: 'none', label: 'Không có', points: 0 },
    ],
  },
  D1: {
    label: 'Thời gian (Duration)',
    options: [
      { value: '60plus', label: '≥ 60 phút', points: 2 },
      { value: '10-59', label: '10 - 59 phút', points: 1 },
      { value: 'less10', label: ' < 10 phút', points: 0 },
    ],
  },
  D2: { label: 'Đái tháo đường (Diabetes)', points: 1 },
};

export const WELLS_CRITERIA_PE = {
    DVT: { label: 'Dấu hiệu lâm sàng của DVT', points: 3 },
    AltDx: { label: 'Chẩn đoán khác ít khả năng hơn PE', points: 3 },
    HR: { label: 'Nhịp tim > 100 lần/phút', points: 1.5 },
    Immob: { label: 'Bất động ≥ 3 ngày hoặc phẫu thuật trong 4 tuần qua', points: 1.5 },
    PrevDVT: { label: 'Tiền sử DVT hoặc PE', points: 1.5 },
    Hemoptysis: { label: 'Ho ra máu', points: 1 },
    Malignancy: { label: 'Bệnh ác tính (đang điều trị hoặc trong vòng 6 tháng)', points: 1 },
};

export const CENTOR_CRITERIA = {
    T: { label: 'Nhiệt độ > 38°C (100.4°F)', points: 1 },
    C: { label: 'Không ho', points: 1 },
    N: { label: 'Sưng hạch cổ trước', points: 1 },
    E: { label: 'Amidan sưng hoặc có xuất tiết', points: 1 },
};


interface UseClinicalScoresProps {
  patient: Patient;
  system: string;
  curb65Criteria: { [key: string]: boolean };
  qsofaCriteria: { [key: string]: boolean };
  chadsvascCriteria: { [key: string]: boolean };
  alvaradoCriteria: { [key: string]: boolean };
  abcd2Criteria: { [key: string]: boolean | string };
  wellsCriteria: { [key: string]: boolean };
  centorCriteria: { [key: string]: boolean };
}

export const useClinicalScores = ({
  patient,
  system,
  curb65Criteria,
  qsofaCriteria,
  chadsvascCriteria,
  alvaradoCriteria,
  abcd2Criteria,
  wellsCriteria,
  centorCriteria
}: UseClinicalScoresProps): { scores: ScoreResult; risk: string } => {
  return useMemo(() => {
    const newScores: { [key: string]: number } = {};
    let riskText = 'Chưa xác định';

    const age = patient.dob ? new Date().getFullYear() - new Date(patient.dob).getFullYear() : 0;

    // CURB-65
    const curbScore = Object.keys(curb65Criteria).filter(key => key !== '65' && curb65Criteria[key]).length + (age >= 65 ? 1 : 0);
    if (Object.keys(curb65Criteria).length > 0 || (system === 'Hô hấp' && age > 0)) {
        newScores['CURB-65'] = curbScore;
    }


    // qSOFA
    const qsofaScore = Object.values(qsofaCriteria).filter(Boolean).length;
    if (Object.keys(qsofaCriteria).length > 0) newScores['qSOFA'] = qsofaScore;

    // CHADS-VASc
    let chadsvascScore = 0;
    Object.entries(chadsvascCriteria).forEach(([key, value]) => {
      if (value) chadsvascScore += CHADSVASC_CRITERIA[key as keyof typeof CHADSVASC_CRITERIA].points;
    });
    if (Object.keys(chadsvascCriteria).length > 0) newScores['CHADS-VASc'] = chadsvascScore;

    // Alvarado
    let alvaradoScore = 0;
    Object.entries(alvaradoCriteria).forEach(([key, value]) => {
      if (value) alvaradoScore += ALVARADO_CRITERIA[key as keyof typeof ALVARADO_CRITERIA].points;
    });
    if (Object.keys(alvaradoCriteria).length > 0) newScores['Alvarado'] = alvaradoScore;

    // ABCD2
    let abcd2Score = 0;
    Object.entries(abcd2Criteria).forEach(([key, value]) => {
        if (key === 'C' || key === 'D1') {
             const criteriaGroup = ABCD2_CRITERIA[key as keyof typeof ABCD2_CRITERIA];
             if ('options' in criteriaGroup) {
                const selectedOption = criteriaGroup.options.find(opt => opt.value === value);
                if (selectedOption) abcd2Score += selectedOption.points;
             }
        } else {
            if (value) {
                const criteria = ABCD2_CRITERIA[key as keyof typeof ABCD2_CRITERIA];
                if ('points' in criteria) abcd2Score += criteria.points;
            }
        }
    });
    const abcd2Interacted = Object.values(abcd2Criteria).some(v => v === true) || abcd2Criteria.C !== 'none' || abcd2Criteria.D1 !== 'less10';
    if (abcd2Interacted) {
       newScores['ABCD2'] = abcd2Score;
    }

    // Wells PE
    let wellsScore = 0;
    Object.entries(wellsCriteria).forEach(([key, value]) => {
      if (value) wellsScore += WELLS_CRITERIA_PE[key as keyof typeof WELLS_CRITERIA_PE].points;
    });
    if (Object.keys(wellsCriteria).length > 0) newScores["Well's PE"] = wellsScore;
    
    // Centor
    let centorScore = 0;
    Object.entries(centorCriteria).forEach(([key, value]) => {
      if (value) centorScore += CENTOR_CRITERIA[key as keyof typeof CENTOR_CRITERIA].points;
    });
     if (age < 3) centorScore = 0;
     else if (age >= 3 && age <= 14) centorScore += 1;
     else if (age > 44) centorScore -= 1;
    if (Object.keys(centorCriteria).length > 0) newScores['Centor'] = centorScore;

    // Determine risk text based on the active system
    switch (system) {
      case 'Hô hấp':
      case 'Tim mạch':
        const curbRisk = curbScore >= 3 ? 'CURB-65: Cao (Nhập viện)' : curbScore >= 2 ? 'CURB-65: Trung bình (Cân nhắc nhập viện)' : 'CURB-65: Thấp (Ngoại trú)';
        const wellsRisk = wellsScore > 6 ? "Wells': Cao (PE khả năng cao)" : wellsScore >= 2 ? "Wells': Trung bình (PE có thể)" : "Wells': Thấp (PE ít khả năng)";
        riskText = `${curbRisk}; ${wellsRisk}`;
        break;
      case 'Nhiễm trùng':
        riskText = qsofaScore >= 2 ? 'Cao (Nghi ngờ Sepsis)' : 'Thấp';
        break;
      case 'Tiêu hóa':
        if (alvaradoScore <= 4) riskText = 'Thấp (Ít khả năng viêm ruột thừa)';
        else if (alvaradoScore <= 6) riskText = 'Trung bình (Cần theo dõi/CLS)';
        else riskText = 'Cao (Nhiều khả năng viêm ruột thừa)';
        break;
      case 'Thần kinh':
        if (abcd2Score <= 3) riskText = 'Thấp (1% nguy cơ đột quỵ trong 2 ngày)';
        else if (abcd2Score <= 5) riskText = 'Trung bình (4.1% nguy cơ đột quỵ trong 2 ngày)';
        else riskText = 'Cao (8.1% nguy cơ đột quỵ trong 2 ngày)';
        break;
      case 'Tai-Mũi-Họng':
        if (centorScore <= 1) riskText = 'Nguy cơ thấp, không cần xét nghiệm/kháng sinh';
        else if (centorScore <= 3) riskText = 'Trung bình, cân nhắc xét nghiệm GAS';
        else riskText = 'Cao, cân nhắc điều trị kháng sinh';
        break;
    }

    return { scores: newScores, risk: riskText };
  }, [patient, system, curb65Criteria, qsofaCriteria, chadsvascCriteria, alvaradoCriteria, abcd2Criteria, wellsCriteria, centorCriteria]);
};
