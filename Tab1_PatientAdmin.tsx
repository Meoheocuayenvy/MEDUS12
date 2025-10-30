// components/tabs/Tab1_PatientAdmin.tsx
import React, { useState, useEffect } from 'react';
import type { Patient, PatientRecord, Encounter } from '../../types';

interface Props {
  patientRecord?: PatientRecord | null;
  encounter?: Encounter | null;
  onStartConsultation: (data: { patient: Omit<Patient, 'id'>, admission: Partial<Encounter> }) => void;
}

const SUGGESTIONS = {
  occupation: ["Hưu trí", "Nông dân", "Công nhân", "Nhân viên văn phòng", "Học sinh/Sinh viên", "Nội trợ"],
  pastMedicalHistory: ["Chưa ghi nhận bệnh lý", "Tăng huyết áp", "Đái tháo đường type 2", "Hen phế quản", "Bệnh tim thiếu máu cục bộ", "Viêm dạ dày"],
  familyHistory: ["Chưa ghi nhận bệnh lý đặc biệt", "Cha/mẹ bị Tăng huyết áp", "Cha/mẹ bị Đái tháo đường"],
  allergies: ["Chưa ghi nhận dị ứng", "Dị ứng Penicillin", "Dị ứng hải sản", "Dị ứng thời tiết"],
  habits: ["Không hút thuốc, không uống rượu bia", "Hút thuốc lá", "Uống rượu bia thường xuyên", "Thỉnh thoảng uống rượu bia"]
};


const InputField: React.FC<{label: string; children: React.ReactNode; className?: string}> = ({label, children, className}) => (
    <div className={className}>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        {children}
    </div>
);

const SuggestiveInputField: React.FC<{
    label: string; name: string; value: any; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    suggestions?: string[]; disabled?: boolean; placeholder?: string;
}> = ({ label, name, value, onChange, suggestions, disabled, placeholder }) => {
    const [inputValue, setInputValue] = useState(value || '');
    const [isTyping, setIsTyping] = useState(false);

    useEffect(() => {
        setInputValue(value || '');
    }, [value]);

    useEffect(() => {
        if (inputValue !== value) {
            setIsTyping(true);
            const handler = setTimeout(() => {
                const event = { target: { name, value: inputValue } } as React.ChangeEvent<HTMLInputElement>;
                onChange(event);
                setIsTyping(false);
            }, 500); // 500ms debounce delay

            return () => {
                clearTimeout(handler);
            };
        } else {
            setIsTyping(false);
        }
    }, [inputValue, name, onChange, value]);
    
    const handleLocalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };

    const handleSuggestionClick = (suggestion: string) => {
        setInputValue(suggestion);
    };
    return (
         <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <div className="relative">
                <input type="text" name={name} value={inputValue} onChange={handleLocalChange} disabled={disabled} placeholder={placeholder} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"/>
                {isTyping && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                )}
            </div>
            {suggestions && !disabled && (
                <div className="flex flex-wrap items-center gap-2 mt-2">
                    {suggestions.map((s) => (
                        <button key={s} type="button" onClick={() => handleSuggestionClick(s)} className="px-2 py-1 text-xs font-semibold text-primary-800 bg-primary-100 rounded-full hover:bg-primary-200 transition-colors border border-primary-200">
                            {s}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const SuggestiveTextareaField: React.FC<{
    label: string; name: string; value: any; onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    suggestions?: string[]; disabled?: boolean; rows?: number; placeholder?: string; className?: string;
}> = ({ label, name, value, onChange, suggestions, disabled, rows=3, placeholder, className }) => {
    const [inputValue, setInputValue] = useState(value || '');
    const [isTyping, setIsTyping] = useState(false);

    useEffect(() => {
        setInputValue(value || '');
    }, [value]);

    useEffect(() => {
        if (inputValue !== value) {
            setIsTyping(true);
            const handler = setTimeout(() => {
                const event = { target: { name, value: inputValue } } as React.ChangeEvent<HTMLTextAreaElement>;
                onChange(event);
                setIsTyping(false);
            }, 500); // 500ms debounce delay

            return () => {
                clearTimeout(handler);
            };
        } else {
            setIsTyping(false);
        }
    }, [inputValue, name, onChange, value]);

    const handleLocalChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInputValue(e.target.value);
    };

    const handleSuggestionClick = (suggestion: string) => {
        const newValue = (inputValue ? inputValue + '. ' : '') + suggestion;
        setInputValue(newValue);
    };
    return (
         <div className={className}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
             <div className="relative">
                <textarea name={name} value={inputValue} onChange={handleLocalChange} disabled={disabled} rows={rows} placeholder={placeholder} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"></textarea>
                {isTyping && (
                    <div className="absolute top-3 right-0 flex items-center pr-3 pointer-events-none">
                        <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                )}
            </div>
            {suggestions && !disabled && (
                 <div className="flex flex-wrap items-center gap-2 mt-2">
                     {suggestions.map((s) => (
                        <button key={s} type="button" onClick={() => handleSuggestionClick(s)} className="px-2 py-1 text-xs font-semibold text-primary-800 bg-primary-100 rounded-full hover:bg-primary-200 transition-colors border border-primary-200">
                            + {s}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const FormSection: React.FC<{title: string; children: React.ReactNode}> = ({title, children}) => (
    <div className="pt-6">
        <h4 className="text-md font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-200">{title}</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {children}
        </div>
    </div>
);

const defaultPatient: Omit<Patient, 'id'> = {
    name: '', dob: '', sex: 'Nam', department: 'Nội tổng quát', phone: '',
    occupation: '', ethnicity: 'Kinh', nationality: 'Việt Nam', address: '',
    workplace: '', subjectType: 'BHYT', bhytNumber: '', bhytExpiry: '',
    emergencyContact: '', emergencyContactPhone: '',
    pastMedicalHistory: '', familyHistory: '', allergies: '', habits: ''
};

const defaultAdmission: Partial<Encounter> = {
    admissionTime: new Date().toISOString().slice(0, 16),
    admissionDepartment: 'KKB',
    referralSource: 'Tự đến',
};

const Tab1_PatientAdmin: React.FC<Props> = ({ patientRecord, encounter, onStartConsultation }) => {
    const [patient, setPatient] = useState(defaultPatient);
    const [admission, setAdmission] = useState(defaultAdmission);

    useEffect(() => {
        if (patientRecord?.patient) setPatient(patientRecord.patient);
        if (encounter) setAdmission(encounter);
    }, [patientRecord, encounter]);

    const handlePatientChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setPatient(prev => ({ ...prev, [name]: value }));
    };
    
    const handleAdmissionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setAdmission(prev => ({ ...prev, [name]: value }));
    };

    const handleStart = () => {
        if (patient.name && patient.dob) {
            onStartConsultation({ patient, admission });
        } else {
            alert("Vui lòng nhập đủ Họ tên và Ngày sinh.");
        }
    };
    
    const isProfileCreated = !!patientRecord;

    return (
        <div className="max-w-3xl mx-auto p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Thông tin Hành chính & Bệnh sử</h3>
            
            <FormSection title="I. Hành chính">
                <InputField label="Họ và tên (*)" className="md:col-span-2">
                    <input type="text" name="name" placeholder="Nguyễn Văn A" value={patient.name} onChange={handlePatientChange} disabled={isProfileCreated} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"/>
                </InputField>
                <InputField label="Ngày sinh (*)">
                    <input type="date" name="dob" value={patient.dob} onChange={handlePatientChange} disabled={isProfileCreated} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"/>
                </InputField>
                <InputField label="Giới tính (*)">
                    <select name="sex" value={patient.sex} onChange={handlePatientChange} disabled={isProfileCreated} className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed">
                        <option>Nam</option><option>Nữ</option><option>Khác</option>
                    </select>
                </InputField>
                <InputField label="Dân tộc"><input type="text" name="ethnicity" value={patient.ethnicity} onChange={handlePatientChange} disabled={isProfileCreated} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"/></InputField>
                <InputField label="Quốc tịch"><input type="text" name="nationality" value={patient.nationality} onChange={handlePatientChange} disabled={isProfileCreated} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"/></InputField>
                <SuggestiveInputField label="Nghề nghiệp" name="occupation" value={patient.occupation} onChange={handlePatientChange} disabled={isProfileCreated} suggestions={SUGGESTIONS.occupation}/>
                <InputField label="Nơi làm việc"><input type="text" name="workplace" value={patient.workplace} onChange={handlePatientChange} disabled={isProfileCreated} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"/></InputField>
                <InputField label="Địa chỉ" className="md:col-span-2"><input type="text" name="address" value={patient.address} onChange={handlePatientChange} disabled={isProfileCreated} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"/></InputField>
                <InputField label="Đối tượng"><select name="subjectType" value={patient.subjectType} onChange={handlePatientChange} disabled={isProfileCreated} className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"><option>BHYT</option><option>Dịch vụ</option><option>Khác</option></select></InputField>
                <InputField label="Số thẻ BHYT"><input type="text" name="bhytNumber" value={patient.bhytNumber} onChange={handlePatientChange} disabled={isProfileCreated} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"/></InputField>
                <InputField label="BHYT có giá trị đến"><input type="date" name="bhytExpiry" value={patient.bhytExpiry} onChange={handlePatientChange} disabled={isProfileCreated} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"/></InputField>
                <InputField label="Người nhà liên hệ"><input type="text" name="emergencyContact" value={patient.emergencyContact} onChange={handlePatientChange} disabled={isProfileCreated} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"/></InputField>
                <InputField label="Điện thoại người nhà"><input type="tel" name="emergencyContactPhone" value={patient.emergencyContactPhone} onChange={handlePatientChange} disabled={isProfileCreated} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"/></InputField>
                 <InputField label="Khoa tiếp nhận"><input type="text" name="department" value={patient.department} onChange={handlePatientChange} disabled={isProfileCreated} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"/></InputField>
            </FormSection>

             <FormSection title="II. Tiền sử bệnh">
                <SuggestiveTextareaField label="Bản thân" name="pastMedicalHistory" value={patient.pastMedicalHistory} onChange={handlePatientChange} disabled={isProfileCreated} suggestions={SUGGESTIONS.pastMedicalHistory} rows={3} className="md:col-span-2"/>
                <SuggestiveTextareaField label="Gia đình" name="familyHistory" value={patient.familyHistory} onChange={handlePatientChange} disabled={isProfileCreated} suggestions={SUGGESTIONS.familyHistory} rows={2} className="md:col-span-2"/>
                <SuggestiveTextareaField label="Dị ứng" name="allergies" value={patient.allergies} onChange={handlePatientChange} disabled={isProfileCreated} suggestions={SUGGESTIONS.allergies} rows={2} placeholder="Ghi rõ loại dị ứng và biểu hiện" className="md:col-span-2"/>
                <SuggestiveTextareaField label="Thói quen (Rượu, bia, thuốc lá...)" name="habits" value={patient.habits} onChange={handlePatientChange} disabled={isProfileCreated} suggestions={SUGGESTIONS.habits} rows={2} className="md:col-span-2"/>
            </FormSection>

            <FormSection title="III. Quản lý vào viện">
                <InputField label="Giờ vào viện"><input type="datetime-local" name="admissionTime" value={admission.admissionTime} onChange={handleAdmissionChange} disabled={isProfileCreated} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"/></InputField>
                <InputField label="Trực tiếp vào"><select name="admissionDepartment" value={admission.admissionDepartment} onChange={handleAdmissionChange} disabled={isProfileCreated} className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"><option value="Cấp cứu">Cấp cứu</option><option value="KKB">KKB</option><option value="Khoa điều trị">Khoa điều trị</option></select></InputField>
                <InputField label="Nơi giới thiệu"><select name="referralSource" value={admission.referralSource} onChange={handleAdmissionChange} disabled={isProfileCreated} className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"><option value="Cơ quan y tế">Cơ quan y tế</option><option value="Tự đến">Tự đến</option><option value="Khác">Khác</option></select></InputField>
                <InputField label="Vào viện lần thứ"><input type="number" name="admissionCountForDisease" value={admission.admissionCountForDisease} onChange={handleAdmissionChange} disabled={isProfileCreated} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"/></InputField>
            </FormSection>

            <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-center gap-4">
                {!isProfileCreated ? (
                    <button onClick={handleStart} className="w-full sm:w-auto bg-primary-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-primary-700 transition-colors shadow-sm hover:shadow-md">
                        Tạo hồ sơ & Bắt đầu khám
                    </button>
                ) : (
                    <p className="text-green-700 bg-green-100 px-4 py-2 rounded-md font-semibold">Hồ sơ đã được tạo. Vui lòng chuyển tab để tiếp tục.</p>
                )}
                 <button className="w-full sm:w-auto bg-white text-gray-800 font-bold py-3 px-8 rounded-lg hover:bg-gray-100 border border-gray-300 transition-colors">
                    Quét QR hồ sơ cũ
                </button>
            </div>
        </div>
    );
};

export default Tab1_PatientAdmin;