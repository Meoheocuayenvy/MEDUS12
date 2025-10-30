import React, { useState, useEffect } from 'react';
import type { Encounter, Patient } from '../../types';
import { getCaseSummary } from '../../services/geminiService';
import { useClinicalScores, CURB65_CRITERIA, QSOFA_CRITERIA, CHADSVASC_CRITERIA, ALVARADO_CRITERIA, ABCD2_CRITERIA, WELLS_CRITERIA_PE, CENTOR_CRITERIA } from '../hooks/useClinicalScores';

interface Props {
  patient: Patient;
  encounter: Encounter;
  setEncounter: (encounter: Encounter) => void;
}

// --- Icons for Symptoms ---
const LungsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 4.5A7.5 7.5 0 0 1 18.75 12c0 2.063-.836 3.943-2.195 5.338a2.25 2.25 0 0 0-.965 1.881V21.75a.75.75 0 0 1-1.5 0v-2.53a2.25 2.25 0 0 0-.965-1.881A7.502 7.502 0 0 1 11.25 4.5Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12.75 4.5A7.5 7.5 0 0 0 5.25 12c0 2.063.836 3.943-2.195 5.338a2.25 2.25 0 0 1 .965 1.881V21.75a.75.75 0 0 0 1.5 0v-2.53a2.25 2.25 0 0 1 .965-1.881A7.502 7.502 0 0 0 12.75 4.5Z" /></svg>;
const CoughIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" /></svg>;
const ChestPainIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" /></svg>;
const ThermometerIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM15 9.75a.75.75 0 0 1 .75.75v6a.75.75 0 0 1-.75.75h-3a.75.75 0 0 1-.75-.75v-6a.75.75 0 0 1 .75-.75h3Z" /></svg>;
const TiredFaceIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.182 16.318A4.5 4.5 0 0 1 12 16.5a4.5 4.5 0 0 1-3.182-.682M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9 9.75a.75.75 0 0 1 .75-.75h.01a.75.75 0 0 1 .75.75v.01a.75.75 0 0 1-.75.75h-.01a.75.75 0 0 1-.75-.75v-.01Zm5.25.01a.75.75 0 0 0-.75-.75h-.01a.75.75 0 0 0-.75.75v.01a.75.75 0 0 0 .75.75h.01a.75.75 0 0 0 .75-.75v-.01Z" /></svg>;
const SnowflakeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a.75.75 0 0 1-.75-.75v-3.75a.75.75 0 0 1 1.5 0V20.25A.75.75 0 0 1 12 21ZM3.75 12a.75.75 0 0 1 .75-.75h3.75a.75.75 0 0 1 0 1.5H4.5a.75.75 0 0 1-.75-.75ZM16.5 8.25a.75.75 0 0 1 .75-.75h3.75a.75.75 0 0 1 0 1.5H17.25a.75.75 0 0 1-.75-.75ZM12 3.75a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V4.5a.75.75 0 0 1 .75-.75ZM6.09 7.59a.75.75 0 0 1 0-1.06l3-3a.75.75 0 1 1 1.06 1.06l-3 3a.75.75 0 0 1-1.06 0Zm12.97 4.97a.75.75 0 0 1 0 1.06l-3 3a.75.75 0 1 1-1.06-1.06l3-3a.75.75 0 0 1 1.06 0Zm-12.97 3.91a.75.75 0 0 1 1.06 0l3 3a.75.75 0 0 1-1.06 1.06l-3-3a.75.75 0 0 1 0-1.06Zm4.97-12.97a.75.75 0 0 1 1.06 0l3 3a.75.75 0 0 1-1.06 1.06l-3-3a.75.75 0 0 1 0-1.06Z" /></svg>;
const MuscleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" /></svg>;
const HeartbeatIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" /></svg>;
const SwollenFootIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" /></svg>;
const StomachPainIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg>;
const VomitIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.658-.463 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /></svg>;
const ToiletIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5M9 11.25v1.5M12 9.75v3.75m3-2.25v1.5" /></svg>;
const HeadacheIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" /></svg>;
const DizzyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m12.75 8.25-1.5 1.5 1.5 1.5m-4.5-3L9.75 9l-1.5 1.5M12 21a8.966 8.966 0 0 1-.79-17.908l-.51.255a8.966 8.966 0 0 0-.79 17.908l.51-.255A8.966 8.966 0 0 1 12 21Z" /></svg>;
const WeaknessIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.5c4.81-1.926 9.694-1.578 14.16-1.578 1.488 0 2.871.218 4.14.618M3 13.5v-3c0-.853.488-1.634 1.25-2.043C5.978 7.54 8.78 7.5 12 7.5c3.22 0 6.021.04 7.75.957 1.155.604 1.75 1.848 1.75 3.103v1.893M3 13.5c0 .853.488 1.634 1.25 2.043 1.729.917 4.531.957 7.75.957 3.22 0 6.021-.04 7.75-.957 1.155-.604 1.75-1.848 1.75-3.103v-1.893" /></svg>;
const SoreThroatIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" /></svg>;

const SYMPTOM_SUGGESTIONS: { [key: string]: { name: string; icon: React.ReactNode }[] } = {
  'Hô hấp': [
    { name: 'Khó thở', icon: <LungsIcon /> },
    { name: 'Ho', icon: <CoughIcon /> },
    { name: 'Đau ngực', icon: <ChestPainIcon /> },
  ],
  'Nhiễm trùng': [
    { name: 'Sốt', icon: <ThermometerIcon /> },
    { name: 'Mệt mỏi', icon: <TiredFaceIcon /> },
    { name: 'Ớn lạnh', icon: <SnowflakeIcon /> },
    { name: 'Đau nhức cơ', icon: <MuscleIcon /> },
  ],
  'Tim mạch': [
    { name: 'Đau ngực', icon: <ChestPainIcon /> },
    { name: 'Khó thở', icon: <LungsIcon /> },
    { name: 'Hồi hộp', icon: <HeartbeatIcon /> },
    { name: 'Phù', icon: <SwollenFootIcon /> },
  ],
  'Tiêu hóa': [
    { name: 'Đau bụng', icon: <StomachPainIcon /> },
    { name: 'Nôn ói', icon: <VomitIcon /> },
    { name: 'Tiêu chảy', icon: <ToiletIcon /> },
  ],
  'Thần kinh': [
    { name: 'Đau đầu', icon: <HeadacheIcon /> },
    { name: 'Chóng mặt', icon: <DizzyIcon /> },
    { name: 'Yếu liệt', icon: <WeaknessIcon /> },
  ],
   'Tai-Mũi-Họng': [
    { name: 'Đau họng', icon: <SoreThroatIcon /> },
    { name: 'Sốt', icon: <ThermometerIcon /> },
    { name: 'Ho', icon: <CoughIcon /> },
  ],
  'Khác': [],
};

const SYSTEMS = ['Hô hấp', 'Nhiễm trùng', 'Tim mạch', 'Tiêu hóa', 'Thần kinh', 'Tai-Mũi-Họng', 'Khác'];
const ANATOMICAL_SYSTEMS = ['Thần kinh', 'Hô hấp', 'Tim mạch', 'Tiêu hóa'];

const SUGGESTIONS = {
  reasonForAdmission: ["Khó thở", "Đau ngực", "Sốt cao", "Ho nhiều", "Đau bụng", "Mệt mỏi", "Hoa mắt chóng mặt"],
  historyOfPresentIllness: ["Bệnh khởi phát cách # ngày", "Ở nhà chưa xử trí gì", "Triệu chứng tăng dần", "Kèm theo ho, không sốt", "Sau khi ăn"],
  general: ["Bệnh nhân tỉnh, tiếp xúc tốt", "Da niêm hồng", "Không phù", "Không xuất huyết dưới da", "Hạch ngoại vi không sờ chạm", "Tuyến giáp không to"],
  cardiovascular: ["Tim đều, T1 T2 rõ", "Không nghe tiếng thổi bệnh lý", "Mạch ngoại vi bắt rõ"],
  respiratory: ["Lồng ngực cân đối, di động theo nhịp thở", "Phổi thông khí đều hai bên", "Rì rào phế nang êm dịu", "Không ran"],
  gastrointestinal: ["Bụng mềm, không chướng", "Gan lách không sờ chạm", "Không có điểm đau khu trú"],
  genitourinary: ["Cầu bàng quang âm tính", "Chạm thận âm tính"],
  neurological: ["Cổ mềm", "Không có dấu thần kinh khu trú", "Sức cơ 5/5"],
  musculoskeletal: ["Các khớp vận động trong giới hạn bình thường", "Không sưng nóng đỏ đau"],
  ent: ["Họng sạch", "Amidan không sưng"],
  dental: ["Chưa ghi nhận bất thường"],
  eyes: ["Chưa ghi nhận bất thường"],
  endocrineNutritional: ["Chưa ghi nhận bất thường"]
};


// --- Component UI phụ ---

const SectionCard: React.FC<{title: string; children: React.ReactNode; defaultOpen?: boolean}> = ({title, children, defaultOpen = true}) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full text-left p-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-6 h-6 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}><path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" /></svg>
            </button>
            {isOpen && <div className="p-4 space-y-4">{children}</div>}
        </div>
    );
}

const HumanBodySelector: React.FC<{selectedSystem: string, onSelect: (system: string) => void}> = ({ selectedSystem, onSelect }) => {
    const [hoveredSystem, setHoveredSystem] = useState<string | null>(null);

    const getPartClass = (system: string) => {
        const base = "fill-gray-300/50 stroke-gray-500 stroke-2 transition-all duration-200 cursor-pointer";
        if (selectedSystem === system) {
            return "fill-primary-500 stroke-primary-700 stroke-[3px]";
        }
        if (hoveredSystem === system) {
            return "fill-primary-300/80 stroke-primary-500 stroke-2";
        }
        return base;
    };
    
    const getButtonClass = (system: string) => {
        const base = "w-full text-left p-3 border rounded-lg font-semibold transition-colors";
         if (selectedSystem === system) {
            return `${base} bg-primary-600 text-white border-primary-700`;
        }
        return `${base} bg-white text-gray-700 border-gray-300 hover:bg-gray-100`;
    }

    const currentSystem = hoveredSystem || selectedSystem;

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Hệ cơ quan (*)</label>
            <div className="flex flex-col sm:flex-row items-start gap-6">
                <div className="relative">
                     <svg viewBox="0 0 200 400" className="w-48 h-auto">
                        <title>Sơ đồ cơ thể người</title>
                        {/* Base silhouette */}
                        <path d="M100 8 C 70 8, 60 30, 60 55 L 60 150 C 60 150, 20 160, 20 250 L 20 350 C 20 380, 40 395, 70 395 L 130 395 C 160 395, 180 380, 180 350 L 180 250 C 180 160, 140 150, 140 150 L 140 55 C 140 30, 130 8, 100 8 Z" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="1"/>
                        
                        {/* Head (Thần kinh, Tai-Mũi-Họng) */}
                        <path d="M100,10 a 35,35 0 1,0 0.001,0 Z" 
                            className={getPartClass('Thần kinh')}
                            onMouseEnter={() => setHoveredSystem('Thần kinh')}
                            onMouseLeave={() => setHoveredSystem(null)}
                            onClick={() => onSelect('Thần kinh')} />
                            
                        {/* Chest (Hô hấp) */}
                        <path d="M70 60 C 65 110, 65 110, 70 160 L 130 160 C 135 110, 135 110, 130 60 Z"
                            className={getPartClass('Hô hấp')}
                            onMouseEnter={() => setHoveredSystem('Hô hấp')}
                            onMouseLeave={() => setHoveredSystem(null)}
                            onClick={() => onSelect('Hô hấp')} />
                            
                        {/* Abdomen (Tiêu hóa) */}
                        <path d="M70 165 C 70 210, 70 210, 70 230 L 130 230 C 130 210, 130 210, 130 165 Z"
                            className={getPartClass('Tiêu hóa')}
                            onMouseEnter={() => setHoveredSystem('Tiêu hóa')}
                            onMouseLeave={() => setHoveredSystem(null)}
                            onClick={() => onSelect('Tiêu hóa')} />

                        {/* Heart (Tim mạch) */}
                        <path d="M100 95 C 90 85, 70 90, 80 110 C 90 130, 110 130, 120 110 C 130 90, 110 85, 100 95 Z"
                            className={getPartClass('Tim mạch')}
                            onMouseEnter={() => setHoveredSystem('Tim mạch')}
                            onMouseLeave={() => setHoveredSystem(null)}
                            onClick={() => onSelect('Tim mạch')}
                        />
                    </svg>
                    {currentSystem && ANATOMICAL_SYSTEMS.includes(currentSystem) && (
                        <div className="absolute top-1/2 -right-2 transform translate-x-full -translate-y-1/2 bg-white px-3 py-1.5 rounded-md shadow-lg border border-gray-200 pointer-events-none">
                            <p className="font-semibold text-primary-700">{currentSystem}</p>
                        </div>
                    )}
                </div>
                <div className="w-full sm:w-48 space-y-3">
                    <button className={getButtonClass('Nhiễm trùng')} onClick={() => onSelect('Nhiễm trùng')}>Nhiễm trùng</button>
                    <button className={getButtonClass('Tai-Mũi-Họng')} onClick={() => onSelect('Tai-Mũi-Họng')}>Tai-Mũi-Họng</button>
                    <button className={getButtonClass('Khác')} onClick={() => onSelect('Khác')}>Khác</button>
                </div>
            </div>
        </div>
    );
};


const CheckboxCriterion: React.FC<{label: string; checked: boolean; onChange: (checked: boolean) => void}> = ({label, checked, onChange}) => (
    <label className="flex items-center p-3 space-x-3 bg-gray-50 rounded-md border border-gray-200 hover:bg-gray-100 cursor-pointer">
        <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
        <span className="text-sm font-medium text-gray-700">{label}</span>
    </label>
);

const RadioCriterion: React.FC<{
    groupName: string;
    label: string;
    options: { value: string; label: string; points: number }[];
    selectedValue: string;
    onChange: (groupName: string, value: string) => void;
}> = ({ groupName, label, options, selectedValue, onChange }) => (
    <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <div className="mt-2 space-y-2">
            {options.map(opt => (
                <label key={opt.value} className="flex items-center space-x-3 cursor-pointer">
                    <input
                        type="radio"
                        name={groupName}
                        value={opt.value}
                        checked={selectedValue === opt.value}
                        onChange={() => onChange(groupName, opt.value)}
                        className="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-600">{`${opt.label} (+${opt.points}đ)`}</span>
                </label>
            ))}
        </div>
    </div>
);

const TextareaField: React.FC<{
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    rows?: number;
    suggestions?: string[];
}> = ({ label, name, value, onChange, rows = 3, suggestions }) => {
    const handleSuggestionClick = (suggestion: string) => {
        const newValue = (value ? value + '. ' : '') + suggestion;
        const event = {
            target: {
                name,
                value: newValue,
            },
        } as React.ChangeEvent<HTMLTextAreaElement>;
        onChange(event);
    };

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <textarea
                name={name}
                value={value}
                onChange={onChange}
                rows={rows}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
            {suggestions && suggestions.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="text-xs text-gray-500 font-medium">Gợi ý:</span>
                    {suggestions.map((suggestion) => (
                        <button
                            key={suggestion}
                            type="button"
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="px-2 py-1 text-xs font-semibold text-primary-800 bg-primary-100 rounded-full hover:bg-primary-200 transition-colors border border-primary-200"
                        >
                            + {suggestion}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const SymptomSelector: React.FC<{
    system: string;
    selectedSymptom: string;
    onSelect: (symptom: string) => void;
}> = ({ system, selectedSymptom, onSelect }) => {
    const suggestions = SYMPTOM_SUGGESTIONS[system] || [];
    if (suggestions.length === 0) return null;

    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {suggestions.map(({ name, icon }) => {
                const isSelected = selectedSymptom === name;
                return (
                    <button
                        key={name}
                        type="button"
                        onClick={() => onSelect(name)}
                        className={`flex flex-col items-center justify-center text-center p-3 border-2 rounded-xl transition-all duration-200 aspect-square
                            ${isSelected
                                ? 'bg-primary-100 border-primary-500 shadow-lg scale-105'
                                : 'bg-white border-gray-200 hover:border-primary-400 hover:bg-primary-50'
                            }`}
                    >
                        <div className="w-8 h-8 text-primary-600">{icon}</div>
                        <span className="mt-2 text-sm font-semibold text-gray-800">{name}</span>
                    </button>
                );
            })}
        </div>
    );
};


// --- Component chính ---

const Tab2_Symptoms: React.FC<Props> = ({ patient, encounter, setEncounter }) => {
    const [curb65Criteria, setCurb65Criteria] = useState<{[key: string]: boolean}>({});
    const [qsofaCriteria, setQsofaCriteria] = useState<{[key: string]: boolean}>({});
    const [chadsvascCriteria, setChadsvascCriteria] = useState<{[key: string]: boolean}>({});
    const [alvaradoCriteria, setAlvaradoCriteria] = useState<{[key: string]: boolean}>({});
    const [abcd2Criteria, setAbcd2Criteria] = useState<{ [key: string]: boolean | string }>({ C: 'none', D1: 'less10'});
    const [wellsCriteria, setWellsCriteria] = useState<{[key: string]: boolean}>({});
    const [centorCriteria, setCentorCriteria] = useState<{[key: string]: boolean}>({});
    const [isSummarizing, setIsSummarizing] = useState(false);

    const { scores, risk } = useClinicalScores({
        patient,
        system: encounter.symptoms.system,
        curb65Criteria,
        qsofaCriteria,
        chadsvascCriteria,
        alvaradoCriteria,
        abcd2Criteria,
        wellsCriteria,
        centorCriteria,
    });

    useEffect(() => {
        if (JSON.stringify(encounter.scores) !== JSON.stringify(scores) || encounter.risk !== risk) {
            setEncounter({ ...encounter, scores, risk });
        }
    }, [scores, risk, encounter, setEncounter]);

    const handleEncounterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const isNumeric = ['dayOfIllness'].includes(name);
        setEncounter({ ...encounter, [name]: isNumeric ? Number(value) : value });
    };

    const handleSymptomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEncounter({ ...encounter, symptoms: { ...encounter.symptoms, [name]: value }});
    };

    const handleMainSymptomSelect = (symptom: string) => {
        const newSymptom = encounter.symptoms.main === symptom ? '' : symptom;
        setEncounter({ ...encounter, symptoms: { ...encounter.symptoms, main: newSymptom }});
    };
    
    const handleSystemSelect = (system: string) => {
        // Reset all scores when system changes
        setCurb65Criteria({}); 
        setQsofaCriteria({});
        setChadsvascCriteria({});
        setAlvaradoCriteria({});
        setAbcd2Criteria({ C: 'none', D1: 'less10'});
        setWellsCriteria({});
        setCentorCriteria({});
        setEncounter({ ...encounter, scores: {}, risk: undefined, symptoms: { ...encounter.symptoms, system: system, main: '' }});
    };
    
    const handlePhysicalExamChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEncounter({
            ...encounter,
            physicalExam: { ...encounter.physicalExam, [name]: value }
        });
    };
    
    const handleGenerateSummary = async () => {
        setIsSummarizing(true);
        try {
            const summary = await getCaseSummary(patient, encounter);
            setEncounter({ ...encounter, summary });
        } catch (error) {
            console.error("Failed to generate summary", error);
            alert("Không thể tạo tóm tắt. Vui lòng thử lại.");
        } finally {
            setIsSummarizing(false);
        }
    };

    const renderScoreCalculator = () => {
        switch (encounter.symptoms.system) {
            case 'Hô hấp':
            case 'Tim mạch':
                const curbScore = encounter.scores['CURB-65'] || 0;
                const wellsScore = encounter.scores["Well's PE"] || 0;
                return <>
                    <SectionCard title="Thang điểm CURB-65 (Viêm phổi cộng đồng)" defaultOpen={false}>
                        <div className="space-y-3">{Object.entries(CURB65_CRITERIA).map(([key, label]) => <CheckboxCriterion key={key} label={label} checked={!!curb65Criteria[key]} onChange={(c) => setCurb65Criteria(p => ({ ...p, [key]: c }))}/>)}</div>
                        <div className="mt-4 p-3 bg-primary-50 border border-primary-200 rounded-lg text-center"><p className="text-sm font-medium text-primary-700">Kết quả</p><p className="text-2xl font-bold text-primary-900">{curbScore} điểm</p><p className="text-sm font-semibold text-primary-800">{encounter.risk?.split(';')[0]}</p></div>
                    </SectionCard>
                    <SectionCard title="Thang điểm Wells (Thuyên tắc phổi)" defaultOpen={false}>
                        <div className="space-y-3">{Object.entries(WELLS_CRITERIA_PE).map(([key, {label, points}]) => <CheckboxCriterion key={key} label={`${label} (+${points}đ)`} checked={!!wellsCriteria[key]} onChange={(c) => setWellsCriteria(p => ({ ...p, [key]: c }))} />)}</div>
                        <div className="mt-4 p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-center"><p className="text-sm font-medium text-indigo-700">Kết quả</p><p className="text-2xl font-bold text-indigo-900">{wellsScore} điểm</p><p className="text-sm font-semibold text-indigo-800">{encounter.risk?.split(';')[1]}</p></div>
                    </SectionCard>
                </>;
            case 'Nhiễm trùng':
                const qsofaScore = encounter.scores['qSOFA'] || 0;
                return <SectionCard title="Thang điểm qSOFA (Sàng lọc Sepsis)" defaultOpen={false}>
                    <div className="space-y-3">{Object.entries(QSOFA_CRITERIA).map(([key, label]) => <CheckboxCriterion key={key} label={label} checked={!!qsofaCriteria[key]} onChange={(c) => setQsofaCriteria(p => ({ ...p, [key]: c }))}/>)}</div>
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-center"><p className="text-sm font-medium text-yellow-700">Kết quả</p><p className="text-2xl font-bold text-yellow-900">{qsofaScore} điểm</p><p className="text-sm font-semibold text-yellow-800">{encounter.risk}</p></div>
                </SectionCard>;
            case 'Tiêu hóa':
                const alvaradoScore = encounter.scores['Alvarado'] || 0;
                return <SectionCard title="Thang điểm Alvarado (Chẩn đoán Viêm ruột thừa cấp)" defaultOpen={false}>
                    {['Symptom', 'Sign', 'Lab'].map(group => (
                        <div key={group} className="mt-4">
                            <h4 className="font-semibold text-gray-600 text-sm mb-2">{group === 'Symptom' ? 'Triệu chứng' : group === 'Sign' ? 'Dấu hiệu' : 'Xét nghiệm (nếu có)'}</h4>
                            <div className="space-y-3">{Object.entries(ALVARADO_CRITERIA).filter(([, val]) => val.group === group).map(([key, {label, points}]) => <CheckboxCriterion key={key} label={`${label} (+${points}đ)`} checked={!!alvaradoCriteria[key]} onChange={(c) => setAlvaradoCriteria(p => ({ ...p, [key]: c }))} />)}</div>
                        </div>
                    ))}
                    <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg text-center"><p className="text-sm font-medium text-orange-700">Kết quả</p><p className="text-2xl font-bold text-orange-900">{alvaradoScore} điểm</p><p className="text-sm font-semibold text-orange-800">{encounter.risk}</p></div>
                </SectionCard>;
            case 'Thần kinh':
                const abcd2Score = encounter.scores['ABCD2'] || 0;
                return <SectionCard title="Thang điểm ABCD2 (Tiên lượng đột quỵ sau TIA)" defaultOpen={false}>
                    <div className="space-y-3">
                        <CheckboxCriterion key="A" label={`${ABCD2_CRITERIA.A.label} (+${ABCD2_CRITERIA.A.points}đ)`} checked={!!abcd2Criteria['A']} onChange={(c) => setAbcd2Criteria(p => ({ ...p, A: c }))} />
                        <CheckboxCriterion key="B" label={`${ABCD2_CRITERIA.B.label} (+${ABCD2_CRITERIA.B.points}đ)`} checked={!!abcd2Criteria['B']} onChange={(c) => setAbcd2Criteria(p => ({ ...p, B: c }))} />
                        <RadioCriterion groupName="clinical" label={ABCD2_CRITERIA.C.label} options={ABCD2_CRITERIA.C.options} selectedValue={String(abcd2Criteria.C)} onChange={(group, val) => setAbcd2Criteria(p => ({ ...p, C: val }))} />
                        <RadioCriterion groupName="duration" label={ABCD2_CRITERIA.D1.label} options={ABCD2_CRITERIA.D1.options} selectedValue={String(abcd2Criteria.D1)} onChange={(group, val) => setAbcd2Criteria(p => ({ ...p, D1: val }))} />
                        <CheckboxCriterion key="D2" label={`${ABCD2_CRITERIA.D2.label} (+${ABCD2_CRITERIA.D2.points}đ)`} checked={!!abcd2Criteria['D2']} onChange={(c) => setAbcd2Criteria(p => ({ ...p, D2: c }))} />
                    </div>
                    <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg text-center"><p className="text-sm font-medium text-purple-700">Kết quả</p><p className="text-2xl font-bold text-purple-900">{abcd2Score} điểm</p><p className="text-sm font-semibold text-purple-800">{encounter.risk}</p></div>
                </SectionCard>;
             case 'Tai-Mũi-Họng':
                const centorScore = encounter.scores['Centor'] || 0;
                 return <SectionCard title="Thang điểm Centor (Viêm họng do Liên cầu)" defaultOpen={false}>
                    <div className="space-y-3">{Object.entries(CENTOR_CRITERIA).map(([key, {label, points}]) => <CheckboxCriterion key={key} label={`${label} (+${points}đ)`} checked={!!centorCriteria[key]} onChange={(c) => setCentorCriteria(p => ({ ...p, [key]: c }))} />)}</div>
                    <div className="mt-4 p-3 bg-teal-50 border border-teal-200 rounded-lg text-center"><p className="text-sm font-medium text-teal-700">Kết quả</p><p className="text-2xl font-bold text-teal-900">{centorScore} điểm</p><p className="text-sm font-semibold text-teal-800">{encounter.risk}</p></div>
                </SectionCard>;
            default: return null;
        }
    };


    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <SectionCard title="II. Hỏi bệnh">
                <TextareaField label="1. Lý do vào viện" name="reasonForAdmission" value={encounter.reasonForAdmission || ''} onChange={handleEncounterChange} rows={2} suggestions={SUGGESTIONS.reasonForAdmission} />
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vào ngày thứ của bệnh</label>
                    <input type="number" name="dayOfIllness" value={encounter.dayOfIllness || ''} onChange={handleEncounterChange} className="w-full p-3 border border-gray-300 rounded-lg" />
                </div>
                <TextareaField label="2. Quá trình bệnh lý" name="historyOfPresentIllness" value={encounter.historyOfPresentIllness || ''} onChange={handleEncounterChange} rows={5} suggestions={SUGGESTIONS.historyOfPresentIllness}/>
            </SectionCard>
            
            <SectionCard title="Thông tin Lâm sàng & Triệu chứng">
                <HumanBodySelector selectedSystem={encounter.symptoms.system} onSelect={handleSystemSelect} />
                 <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Triệu chứng chính (*)</label>
                    <SymptomSelector 
                        system={encounter.symptoms.system}
                        selectedSymptom={encounter.symptoms.main}
                        onSelect={handleMainSymptomSelect}
                    />
                    <input 
                        type="text" 
                        name="main" 
                        placeholder="Hoặc nhập triệu chứng khác..." 
                        value={encounter.symptoms.main} 
                        onChange={handleSymptomChange} 
                        className="w-full p-3 mt-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" 
                    />
                </div>
            </SectionCard>

            {renderScoreCalculator()}

            <SectionCard title="III. Khám bệnh">
                <div className="space-y-4">
                    <TextareaField label="1. Toàn thân" name="general" value={encounter.physicalExam?.general || ''} onChange={handlePhysicalExamChange} suggestions={SUGGESTIONS.general} />
                    <TextareaField label="2. Tuần hoàn" name="cardiovascular" value={encounter.physicalExam?.cardiovascular || ''} onChange={handlePhysicalExamChange} suggestions={SUGGESTIONS.cardiovascular} />
                    <TextareaField label="3. Hô hấp" name="respiratory" value={encounter.physicalExam?.respiratory || ''} onChange={handlePhysicalExamChange} suggestions={SUGGESTIONS.respiratory} />
                    <TextareaField label="4. Tiêu hóa" name="gastrointestinal" value={encounter.physicalExam?.gastrointestinal || ''} onChange={handlePhysicalExamChange} suggestions={SUGGESTIONS.gastrointestinal} />
                    <TextareaField label="5. Thận - Tiết niệu - Sinh dục" name="genitourinary" value={encounter.physicalExam?.genitourinary || ''} onChange={handlePhysicalExamChange} suggestions={SUGGESTIONS.genitourinary} />
                    <TextareaField label="6. Thần kinh" name="neurological" value={encounter.physicalExam?.neurological || ''} onChange={handlePhysicalExamChange} suggestions={SUGGESTIONS.neurological} />
                    <TextareaField label="7. Cơ - Xương - Khớp" name="musculoskeletal" value={encounter.physicalExam?.musculoskeletal || ''} onChange={handlePhysicalExamChange} suggestions={SUGGESTIONS.musculoskeletal} />
                    <TextareaField label="8. Tai - Mũi - Họng" name="ent" value={encounter.physicalExam?.ent || ''} onChange={handlePhysicalExamChange} suggestions={SUGGESTIONS.ent} />
                    <TextareaField label="9. Răng - Hàm - Mặt" name="dental" value={encounter.physicalExam?.dental || ''} onChange={handlePhysicalExamChange} suggestions={SUGGESTIONS.dental} />
                    <TextareaField label="10. Mắt" name="eyes" value={encounter.physicalExam?.eyes || ''} onChange={handlePhysicalExamChange} suggestions={SUGGESTIONS.eyes} />
                    <TextareaField label="11. Nội tiết, dinh dưỡng và các bệnh lý khác" name="endocrineNutritional" value={encounter.physicalExam?.endocrineNutritional || ''} onChange={handlePhysicalExamChange} suggestions={SUGGESTIONS.endocrineNutritional} />
                </div>
            </SectionCard>
            
             <SectionCard title="Tóm tắt bệnh án">
                <div className="flex justify-between items-center mb-1">
                    <label htmlFor="summary-textarea" className="block text-sm font-medium text-gray-700">Nội dung tóm tắt</label>
                    <button 
                        onClick={handleGenerateSummary} 
                        disabled={isSummarizing}
                        className="flex items-center justify-center text-sm font-semibold text-primary-600 hover:text-primary-800 disabled:opacity-50 disabled:cursor-wait transition-colors py-1 px-3 rounded-md bg-primary-50 hover:bg-primary-100 border border-primary-200"
                    >
                        {isSummarizing ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Đang tạo...
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                </svg>
                                AI Tạo tóm tắt
                            </>
                        )}
                    </button>
                </div>
                <textarea
                    id="summary-textarea"
                    name="summary"
                    value={encounter.summary || ''}
                    onChange={handleEncounterChange}
                    rows={5}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Nhập tóm tắt bệnh án tại đây hoặc sử dụng AI để tạo tự động..."
                />
            </SectionCard>
        </div>
    );
};

export default Tab2_Symptoms;
