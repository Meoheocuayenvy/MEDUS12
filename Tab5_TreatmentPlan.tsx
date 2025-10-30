// components/tabs/Tab5_TreatmentPlan.tsx
import React from 'react';
import type { Encounter, Antibiotic } from '../../types';

interface Props {
  encounter: Encounter;
  setEncounter: (encounter: Encounter) => void;
}

const TreatmentCard: React.FC<{title: string; children: React.ReactNode; titleIcon?: React.ReactNode}> = ({title, children, titleIcon}) => (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
         <div className="p-4 border-b border-gray-200 flex items-center">
             {titleIcon}
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        </div>
        <div className="p-4">
            {children}
        </div>
    </div>
);

const AntibioticList: React.FC<{antibiotics: Antibiotic[]}> = ({antibiotics}) => (
    <ul className="space-y-3">
        {antibiotics.length > 0 ? antibiotics.map((t, i) => (
            <li key={i} className="p-3 bg-gray-50 rounded-md border border-gray-200">
                <p className="font-semibold text-gray-800">{t.name}</p>
                <p className="text-sm text-gray-600">{`${t.dose} - ${t.route} - ${t.frequency}`}{t.duration && ` - trong ${t.duration}`}</p>
                {t.adjustments && <p className="text-xs text-blue-600 mt-1 font-medium bg-blue-100 p-1 rounded">Lưu ý chỉnh liều: {t.adjustments.eGFR} → {t.adjustments.adjusted_dose}</p>}
            </li>
        )) : <p className="text-sm text-gray-500">Không có chỉ định.</p>}
    </ul>
);

const InputField: React.FC<{label: string; name: string; type?: string; value: any; onChange: (e: React.ChangeEvent<any>) => void; children?: React.ReactNode; className?: string}> = ({label, name, type="text", value, onChange, children, className}) => (
     <div className={className}>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        {children ? (
            <select name={name} value={value || ''} onChange={onChange} className="w-full p-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-primary-500">{children}</select>
        ) : (
            <input type={type} name={name} value={value || ''} onChange={onChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"/>
        )}
    </div>
);

const Tab5_TreatmentPlan: React.FC<Props> = ({ encounter, setEncounter }) => {
    const cds = encounter.cds_results;

    const handleEncounterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const isCheckbox = type === 'checkbox';
        const checked = (e.target as HTMLInputElement).checked;
        setEncounter({ ...encounter, [name]: isCheckbox ? checked : value });
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            alert("Đã sao chép SOAP note vào clipboard!");
        }, (err) => {
            alert("Lỗi khi sao chép.");
            console.error('Could not copy text: ', err);
        });
    };

    const soapText = cds ? `S: ${cds.soap_note.subjective}\nO: ${cds.soap_note.objective}\nA: ${cds.soap_note.assessment}\nP: ${cds.soap_note.plan}` : '';

    return (
        <div className="max-w-4xl mx-auto space-y-6">
             {!cds ? (
                <div className="text-center p-12 bg-white rounded-lg border-2 border-dashed">
                     <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c.252 0 .487.02.718.057m-1.436 2.383c.44 1.062 1.52 1.848 2.753 1.848 1.233 0 2.313-.786 2.753-1.848m-5.506 0A7.5 7.5 0 0112 3.75a7.5 7.5 0 015.25 2.25m-10.5 0a7.5 7.5 0 00-4.132 9.043l1.832 4.125a3.375 3.375 0 006.294 0l1.832-4.125a7.5 7.5 0 00-4.132-9.043Z" />
                     </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Chưa có gợi ý phác đồ</h3>
                    <p className="mt-1 text-sm text-gray-500">Hoàn tất Tab "Triệu chứng" và nhấn "Tiếp theo" để AI tạo phác đồ.</p>
                </div>
            ) : (
                <div className="animate-fade-in space-y-6">
                    <div className="p-4 border rounded-lg bg-primary-50 border-primary-200">
                        <p className="text-sm font-medium text-primary-700">Chẩn đoán xác định</p>
                        <p className="font-bold text-xl text-primary-900">{encounter.dx_final || 'Chưa có'}</p>
                    </div>

                    {cds.spo2_target && (
                         <div className="p-4 border rounded-lg bg-blue-50 border-blue-200 flex items-center justify-between">
                            <p className="font-semibold text-blue-800">Mục tiêu SpO₂</p>
                            <p className="font-bold text-xl text-blue-900">{cds.spo2_target}</p>
                        </div>
                    )}

                    {cds.antibiotic_plan && (
                         <TreatmentCard title="Phác đồ kháng sinh gợi ý">
                            <div className="space-y-4">
                                <AntibioticList antibiotics={cds.antibiotic_plan.regimen} />
                                {cds.antibiotic_plan.notes && <p className="text-sm text-gray-600 mt-2"><strong>Ghi chú:</strong> {cds.antibiotic_plan.notes}</p>}
                                {cds.antibiotic_plan.warnings && cds.antibiotic_plan.warnings.length > 0 && (
                                    <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                                        <ul className="list-disc list-inside text-sm text-yellow-800 font-medium">
                                            {cds.antibiotic_plan.warnings.map((w, i) => <li key={i}>{w}</li>)}
                                        </ul>
                                    </div>
                                )}
                            </div>
                         </TreatmentCard>
                    )}
                    
                    <TreatmentCard title="Ghi chú SOAP">
                        <div className="space-y-2 text-sm text-gray-800 bg-gray-50 p-4 rounded-md border">
                            <p><strong className="font-semibold text-gray-900">S:</strong> {cds.soap_note.subjective}</p>
                            <p><strong className="font-semibold text-gray-900">O:</strong> {cds.soap_note.objective}</p>
                            <p><strong className="font-semibold text-gray-900">A:</strong> {cds.soap_note.assessment}</p>
                            <p><strong className="font-semibold text-gray-900">P:</strong> {cds.soap_note.plan}</p>
                        </div>
                        <button onClick={() => copyToClipboard(soapText)} className="mt-4 bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                            Sao chép vào Clipboard
                        </button>
                    </TreatmentCard>

                </div>
            )}

            <TreatmentCard title="IV. Tình trạng ra viện">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label="Giờ ra viện" name="dischargeTime" type="datetime-local" value={encounter.dischargeTime} onChange={handleEncounterChange} />
                    <InputField label="Hình thức ra viện" name="dischargeStatus" value={encounter.dischargeStatus} onChange={handleEncounterChange}>
                        <option value="">Chọn...</option><option>Ra viện</option><option>Xin về</option><option>Bỏ về</option><option>Đưa về</option>
                    </InputField>
                    <InputField label="Kết quả điều trị" name="treatmentResult" value={encounter.treatmentResult} onChange={handleEncounterChange} className="md:col-span-2">
                         <option value="">Chọn...</option><option>Khỏi</option><option>Đỡ, giảm</option><option>Không thay đổi</option><option>Nặng hơn</option><option>Tử vong</option>
                    </InputField>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Giải phẫu bệnh (khi có sinh thiết)</label>
                        <textarea name="pathologyResult" value={encounter.pathologyResult || ''} onChange={handleEncounterChange} rows={3} className="w-full p-2 border border-gray-300 rounded-lg"/>
                    </div>
                </div>
                {encounter.treatmentResult === 'Tử vong' && (
                    <div className="mt-6 pt-4 border-t border-dashed border-red-300 space-y-4">
                        <h4 className="font-semibold text-red-700">Thông tin tử vong</h4>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField label="Ngày giờ tử vong" name="deathTime" type="datetime-local" value={encounter.deathTime} onChange={handleEncounterChange}/>
                            <InputField label="Thời điểm" name="deathTiming" value={encounter.deathTiming} onChange={handleEncounterChange}><option value="">Chọn...</option><option>Trong 24 giờ</option><option>Sau 24 giờ</option></InputField>
                            <InputField label="Nguyên nhân" name="causeOfDeathCategory" value={encounter.causeOfDeathCategory} onChange={handleEncounterChange} className="md:col-span-2"><option value="">Chọn...</option><option>Do bệnh</option><option>Do tai biến điều trị</option><option>Khác</option></InputField>
                            <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Nguyên nhân chính tử vong</label><textarea name="primaryCauseOfDeath" value={encounter.primaryCauseOfDeath || ''} onChange={handleEncounterChange} rows={2} className="w-full p-2 border border-gray-300 rounded-lg"/></div>
                            <div className="md:col-span-2"><label className="flex items-center space-x-2"><input type="checkbox" name="autopsyPerformed" checked={encounter.autopsyPerformed || false} onChange={handleEncounterChange} className="h-4 w-4 rounded"/><span>Có khám nghiệm tử thi</span></label></div>
                            {encounter.autopsyPerformed && <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Chẩn đoán giải phẫu tử thi</label><textarea name="autopsyDiagnosis" value={encounter.autopsyDiagnosis || ''} onChange={handleEncounterChange} rows={2} className="w-full p-2 border border-gray-300 rounded-lg"/></div>}
                        </div>
                    </div>
                )}
            </TreatmentCard>
        </div>
    );
};

export default Tab5_TreatmentPlan;
