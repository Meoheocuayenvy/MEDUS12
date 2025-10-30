// components/PatientView.tsx

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { PatientRecord, Encounter } from '../types';

// Các icon components (giữ nguyên không đổi)
const InfoCard: React.FC<{title: string; icon: React.ReactNode; children: React.ReactNode}> = ({title, icon, children}) => (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
        <div className="flex items-start">
            <div className="flex-shrink-0 h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">{icon}</div>
            <div className="ml-4 w-full"><h3 className="text-lg font-semibold text-gray-500">{title}</h3><div className="mt-1 text-gray-800 font-medium whitespace-pre-wrap">{children}</div></div>
        </div>
    </div>
);
const DiagnosisIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>;
const AdviceIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const PatientIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const BrainIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600" viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" d="M12 21a8.25 8.25 0 0 0 8.25-8.25c0-4.556-3.694-8.25-8.25-8.25S3.75 8.194 3.75 12.75A8.25 8.25 0 0 0 12 21Zm0 1.5a9.75 9.75 0 0 0 9.75-9.75C21.75 7.364 17.386 3 12 3S2.25 7.364 2.25 12.75A9.75 9.75 0 0 0 12 22.5Z" clipRule="evenodd" /></svg>;

const PatientView: React.FC = () => {
  const { data } = useParams<{ data: string }>();
  const [record, setRecord] = useState<PatientRecord | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (data) {
      try {
        const jsonString = decodeURIComponent(atob(data));
        const parsedData: PatientRecord = JSON.parse(jsonString);
        setRecord(parsedData);
      } catch (e) {
        setError("Dữ liệu không hợp lệ hoặc mã QR đã bị hỏng.");
      }
    }
  }, [data]);

  if (error) return <div className="text-red-600 text-center p-8">{error}</div>;
  if (!record) return <div className="text-center p-8">Đang tải...</div>;

  const latestEncounter = record.encounters[record.encounters.length - 1];
  
  let age: string | number = 'N/A';
  if (record.patient.dob) {
      const birthDate = new Date(record.patient.dob);
      if (!isNaN(birthDate.getTime())) {
          age = new Date().getFullYear() - birthDate.getFullYear();
      }
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="bg-gray-100 p-8 rounded-xl border border-gray-200">
        <h2 className="text-3xl font-bold text-center text-primary-800 mb-2">Hồ Sơ Y Tế Điện Tử</h2>
        <p className="text-center text-gray-500 text-sm mb-8">
          Ngày tạo: {new Date(latestEncounter.createdAt).toLocaleString('vi-VN')}
        </p>

        <div className="space-y-6">
            <InfoCard title="Thông tin Bệnh nhân" icon={<PatientIcon/>}>
                <p><strong>Họ và tên:</strong> {record.patient.name}</p>
                {record.patient.dob && <p><strong>Ngày sinh:</strong> {new Date(record.patient.dob).toLocaleDateString('vi-VN')}</p>}
                <p><strong>Tuổi:</strong> {age}</p>
                <p><strong>Giới tính:</strong> {record.patient.sex}</p>
            </InfoCard>

            <InfoCard title="Chẩn đoán của Bác sĩ" icon={<DiagnosisIcon/>}>
                <p className="font-bold text-lg text-primary-700">{latestEncounter.dx_final || 'Chưa có chẩn đoán xác định'}</p>
            </InfoCard>
            
            {latestEncounter.doctor_advice && (
                <InfoCard title="Lời khuyên & Kế hoạch điều trị của Bác sĩ" icon={<AdviceIcon/>}>
                    <p>{latestEncounter.doctor_advice}</p>
                </InfoCard>
            )}
            
            {latestEncounter.treatment_plan && (
              <InfoCard title="Phác đồ gợi ý từ AI" icon={<BrainIcon/>}>
                  <div className="prose prose-sm max-w-none">
                     {latestEncounter.treatment_plan.main.map((t, i) => <p key={i}>{`- ${t.name} ${t.dose} ${t.route} ${t.frequency}`}</p>)}
                     <p><strong>Theo dõi:</strong> {latestEncounter.treatment_plan.monitor.join(', ')}</p>
                     <p><strong>Khuyến cáo:</strong> {latestEncounter.treatment_plan.recommendation}</p>
                  </div>
              </InfoCard>
            )}
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-500">
            Đây là thông tin tham khảo. Vui lòng tuân thủ chỉ định của bác sĩ và tái khám đúng hẹn.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PatientView;