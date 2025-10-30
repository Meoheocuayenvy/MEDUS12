// components/MainLayout.tsx
import React, { useState } from 'react';
import type { Patient, PatientRecord, Encounter, ClinicalDecisionSupport } from '../types';
import Tab1_PatientAdmin from './tabs/Tab1_PatientAdmin';
import Tab2_Symptoms from './tabs/Tab2_Symptoms';
import Tab3_ProvisionalDx from './tabs/Tab3_ProvisionalDx';
import Tab4_Labs from './tabs/Tab4_Labs';
import Tab5_TreatmentPlan from './tabs/Tab5_TreatmentPlan';
import Tab6_Dashboard from './tabs/Tab6_Dashboard';
import Loader from './Loader';
import { getClinicalDecisionSupport } from '../services/geminiService';


// Icons for navigation (using outline for inactive, solid for active)
const AdminIcon = ({isActive}:{isActive:boolean}) => <svg xmlns="http://www.w3.org/2000/svg" fill={isActive ? 'currentColor' : 'none'} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>;
const SymptomsIcon = ({isActive}:{isActive:boolean}) => <svg xmlns="http://www.w3.org/2000/svg" fill={isActive ? 'currentColor' : 'none'} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>;
const DiagnosisIcon = ({isActive}:{isActive:boolean}) => <svg xmlns="http://www.w3.org/2000/svg" fill={isActive ? 'currentColor' : 'none'} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 6.471 3H5.25A2.25 2.25 0 0 0 3 5.25v13.5A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75v-2.625" /></svg>;
const LabsIcon = ({isActive}:{isActive:boolean}) => <svg xmlns="http://www.w3.org/2000/svg" fill={isActive ? 'currentColor' : 'none'} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c.252 0 .487.02.718.057m-1.436 2.383c.44 1.062 1.52 1.848 2.753 1.848 1.233 0 2.313-.786 2.753-1.848m-5.506 0A7.5 7.5 0 0 1 12 3.75a7.5 7.5 0 0 1 5.25 2.25m-10.5 0a7.5 7.5 0 0 0-4.132 9.043l1.832 4.125a3.375 3.375 0 0 0 6.294 0l1.832-4.125a7.5 7.5 0 0 0-4.132-9.043Z" /></svg>;
const PlanIcon = ({isActive}:{isActive:boolean}) => <svg xmlns="http://www.w3.org/2000/svg" fill={isActive ? 'currentColor' : 'none'} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg>;
const DashboardIcon = ({isActive}:{isActive:boolean}) => <svg xmlns="http://www.w3.org/2000/svg" fill={isActive ? 'currentColor' : 'none'} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" /></svg>;

const TABS = [
  { id: 1, name: 'Hành chính', icon: AdminIcon },
  { id: 2, name: 'Triệu chứng', icon: SymptomsIcon },
  { id: 3, name: 'Chẩn đoán', icon: DiagnosisIcon },
  { id: 4, name: 'CLS', icon: LabsIcon },
  { id: 5, name: 'Phác đồ', icon: PlanIcon },
  { id: 6, name: 'Dashboard', icon: DashboardIcon },
];

const MainLayout: React.FC = () => {
    const [activeTab, setActiveTab] = useState(1);
    const [patientRecord, setPatientRecord] = useState<PatientRecord | null>(null);
    const [currentEncounter, setCurrentEncounter] = useState<Encounter | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [maxCompletedTab, setMaxCompletedTab] = useState(1);
    const [cds, setCds] = useState<ClinicalDecisionSupport | null>(null);


    const handleStartConsultation = (formData: { patient: Omit<Patient, 'id'>, admission: Partial<Encounter> }) => {
        const patientId = `P-${Date.now()}`;
        const newPatient: Patient = { ...formData.patient, id: patientId };

        const newEncounter: Encounter = {
            id: `enc-${Date.now()}`,
            patientId: patientId,
            createdAt: formData.admission.admissionTime || new Date().toISOString(),
            ...formData.admission,
            symptoms: { system: 'Hô hấp', main: '', secondary: [] },
            scores: {},
            physicalExam: {},
        };

        const newRecord: PatientRecord = {
            patient: newPatient,
            encounters: [newEncounter],
        };
        
        setPatientRecord(newRecord);
        setCurrentEncounter(newEncounter);
        setCds(null);
        setActiveTab(2);
        setMaxCompletedTab(2);
    };

    const updateCurrentEncounter = (updatedEncounter: Encounter) => {
        setCurrentEncounter(updatedEncounter);
        if (patientRecord) {
            setPatientRecord(prev => ({
                ...prev!,
                encounters: prev!.encounters.map(enc =>
                    enc.id === updatedEncounter.id ? updatedEncounter : enc
                )
            }));
        }
    };

    const handlePrevious = () => {
        setActiveTab(prev => Math.max(1, prev - 1));
    };

    const handleNext = async () => {
        setIsLoading(true);
        try {
            let nextTab = activeTab + 1;
            
            if (activeTab === 2) {
                if (!currentEncounter?.symptoms.main) {
                    alert("Vui lòng nhập triệu chứng chính.");
                    setIsLoading(false);
                    return;
                }
                const result = await getClinicalDecisionSupport(patientRecord!.patient, currentEncounter!);
                setCds(result);
                updateCurrentEncounter({
                    ...currentEncounter!,
                    cds_results: result,
                });
            } else if (activeTab === 3) {
                 if (!currentEncounter?.dx_final) {
                    alert("Vui lòng chọn ít nhất một chẩn đoán từ danh sách gợi ý.");
                    setIsLoading(false);
                    return;
                }
            } else if (activeTab === 4) {
                 if (!currentEncounter?.dx_final) {
                    alert("Vui lòng nhập chẩn đoán xác định.");
                    setIsLoading(false);
                    return;
                }
            }
            
            if (nextTab > 6) nextTab = 6;
            setActiveTab(nextTab);
            setMaxCompletedTab(prev => Math.max(prev, nextTab));
        } catch (error) {
            console.error("Lỗi trong quá trình chuyển bước:", error);
            alert(`Đã xảy ra lỗi: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
            setIsLoading(false);
        }
    };

    const renderTabContent = () => {
        if (!patientRecord) {
            return <Tab1_PatientAdmin onStartConsultation={handleStartConsultation} />;
        }

        switch (activeTab) {
            case 1: return <Tab1_PatientAdmin onStartConsultation={handleStartConsultation} patientRecord={patientRecord} encounter={currentEncounter} />;
            case 2: return <Tab2_Symptoms patient={patientRecord.patient} encounter={currentEncounter!} setEncounter={updateCurrentEncounter} />;
            case 3: return <Tab3_ProvisionalDx encounter={currentEncounter!} setEncounter={updateCurrentEncounter} patient={patientRecord.patient} />;
            case 4: return <Tab4_Labs encounter={currentEncounter!} setEncounter={updateCurrentEncounter} />;
            case 5: return <Tab5_TreatmentPlan encounter={currentEncounter!} setEncounter={updateCurrentEncounter} />;
            case 6: return <Tab6_Dashboard patientRecord={patientRecord} />;
            default: return <Tab1_PatientAdmin onStartConsultation={handleStartConsultation} />;
        }
    };
    
    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            {cds?.red_flags && cds.red_flags.length > 0 && (
              <div className="mb-4 bg-red-100 border-l-4 border-red-500 text-red-800 p-4 rounded-md shadow-lg" role="alert">
                <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                    <p className="font-bold text-lg">CẢNH BÁO KHẨN (RED FLAGS)</p>
                </div>
                <ul className="mt-2 list-disc list-inside ml-2">
                    {cds.red_flags.map((flag, i) => <li key={i}>{flag.message}</li>)}
                </ul>
                {cds.triage_action && <p className="mt-3 font-semibold text-base">HÀNH ĐỘNG GỢI Ý: {cds.triage_action}</p>}
              </div>
            )}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 flex flex-col min-h-[85vh] overflow-hidden">
                <div className="p-6 border-b border-gray-200 bg-gray-50/50">
                    <h2 className="text-xl font-bold text-gray-800">{TABS.find(t => t.id === activeTab)?.name}</h2>
                    {patientRecord && <p className="text-sm text-gray-500">Bệnh nhân: {patientRecord.patient.name}</p>}
                </div>

                <main className="flex-grow p-6 overflow-y-auto relative bg-gray-50">
                    {isLoading && (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                            <svg className="animate-spin h-12 w-12 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <p className="mt-4 text-lg font-semibold text-gray-700">AI đang phân tích...</p>
                        </div>
                    )}
                    {renderTabContent()}
                </main>

                <div className="flex flex-col">
                    {patientRecord && activeTab > 1 && activeTab < 6 && (
                        <div className="flex justify-between p-4 border-t border-gray-200 bg-white">
                            <button 
                                onClick={handlePrevious} 
                                disabled={isLoading}
                                className="bg-white text-gray-700 font-bold py-2 px-6 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors disabled:opacity-50">
                                Quay lại
                            </button>
                            <button 
                                onClick={handleNext} 
                                disabled={isLoading} 
                                className="bg-primary-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-primary-700 flex items-center justify-center disabled:bg-primary-400 disabled:cursor-not-allowed transition-colors min-w-[120px] shadow-sm hover:shadow-md">
                                {isLoading ? <Loader /> : (activeTab === 5 ? 'Hoàn tất' : 'Tiếp theo')}
                            </button>
                        </div>
                    )}

                    {cds?.legal_notice && (
                      <div className="p-3 text-center text-xs text-gray-500 bg-gray-100 border-t border-gray-200">
                        <strong>Tuyên bố miễn trừ trách nhiệm:</strong> {cds.legal_notice}
                      </div>
                    )}

                    <nav className="w-full bg-gray-100/80 border-t border-gray-200 grid grid-cols-6 backdrop-blur-sm">
                        {TABS.map(tab => {
                            const isActive = activeTab === tab.id;
                            const isAllowed = tab.id <= maxCompletedTab;
                            const isDisabled = !patientRecord && tab.id > 1;

                            const buttonClasses = `relative flex flex-col items-center justify-center p-3 text-xs font-medium transition-colors duration-200 
                                ${isActive ? 'text-primary-600' : isAllowed ? 'text-gray-500 hover:bg-gray-200/50' : 'text-gray-300'}
                                ${isDisabled || !isAllowed ? 'opacity-70 cursor-not-allowed' : ''}`;

                            return (
                                <button key={tab.id} onClick={() => !isDisabled && isAllowed && setActiveTab(tab.id)} disabled={isDisabled || !isAllowed} className={buttonClasses}>
                                    {isActive && <div className="absolute top-0 h-1 w-12 bg-primary-600 rounded-b-full"></div>}
                                    <tab.icon isActive={isActive} />
                                    <span className="mt-1">{tab.name}</span>
                                </button>
                            );
                        })}
                    </nav>
                </div>
            </div>
        </div>
    );
};

export default MainLayout;