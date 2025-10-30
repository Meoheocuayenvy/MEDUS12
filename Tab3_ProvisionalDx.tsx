// components/tabs/Tab3_ProvisionalDx.tsx
import React from 'react';
import type { Encounter, Patient, RecommendedTest, Differential } from '../../types';

interface Props {
  patient: Patient;
  encounter: Encounter;
  setEncounter: (encounter: Encounter) => void;
}

const LikelihoodBar: React.FC<{ value: number }> = ({ value }) => {
    const percentage = Math.round(value * 100);
    let colorClass = 'bg-green-500';
    if (percentage < 70) colorClass = 'bg-yellow-500';
    if (percentage < 40) colorClass = 'bg-orange-500';
    
    return (
        <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className={`${colorClass} h-2.5 rounded-full`} style={{ width: `${percentage}%` }}></div>
        </div>
    );
};


const PriorityBadge: React.FC<{priority: RecommendedTest['priority']}> = ({priority}) => {
    const priorityMap = {
        'STAT': { text: 'Khẩn', colors: 'bg-red-100 text-red-800 border-red-300' },
        'SOON': { text: 'Sớm', colors: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
        'ROUTINE': { text: 'Thường quy', colors: 'bg-blue-100 text-blue-800 border-blue-300' }
    };
    const { text, colors } = priorityMap[priority] || { text: priority, colors: 'bg-gray-100 text-gray-800 border-gray-300' };

    return <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full border ${colors}`}>{text}</span>
}

const SectionCard: React.FC<{title: string; icon: React.ReactNode; children: React.ReactNode}> = ({title, icon, children}) => (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-200 flex items-center">
            <div className="text-primary-600">{icon}</div>
            <h3 className="text-lg font-semibold text-gray-800 ml-3">{title}</h3>
        </div>
        <div className="p-4 space-y-4">{children}</div>
    </div>
);


const Tab3_ProvisionalDx: React.FC<Props> = ({ encounter, setEncounter }) => {
    const cds = encounter.cds_results;

    const selectedDiagnoses = encounter.dx_final ? encounter.dx_final.split('; ').filter(Boolean) : [];

    const handleDxSelectionChange = (diagnosis: Differential) => {
        const dxString = diagnosis.icd_code ? `${diagnosis.dx} (${diagnosis.icd_code})` : diagnosis.dx;
        
        const isSelected = selectedDiagnoses.includes(dxString);
        let newSelected: string[];

        if (isSelected) {
            newSelected = selectedDiagnoses.filter(d => d !== dxString);
        } else {
            newSelected = [...selectedDiagnoses, dxString];
        }

        setEncounter({
            ...encounter,
            dx_final: newSelected.join('; ')
        });
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {!cds ? (
                <div className="text-center p-12 bg-white rounded-lg border-2 border-dashed">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v8a2 2 0 01-2-2H5a2 2 0 01-2-2z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Chưa có gợi ý chẩn đoán từ AI</h3>
                    <p className="mt-1 text-sm text-gray-500">Vui lòng hoàn tất Tab "Triệu chứng" và nhấn "Tiếp theo" để nhận gợi ý từ AI.</p>
                </div>
            ) : (
                <div className="space-y-6 animate-fade-in">
                    <SectionCard 
                        title="Chẩn đoán phân biệt (Gợi ý từ AI)"
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>}
                    >
                        <div className="space-y-4">
                            {cds.differentials.map((dx, index) => (
                                <div key={index} className="p-4 rounded-lg border border-gray-200 bg-gray-50/50">
                                    <div className="flex justify-between items-start mb-2">
                                         <label className="flex items-center space-x-3 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                className="h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                                checked={selectedDiagnoses.includes(dx.icd_code ? `${dx.dx} (${dx.icd_code})` : dx.dx)}
                                                onChange={() => handleDxSelectionChange(dx)}
                                            />
                                            <h4 className="font-bold text-lg text-primary-800 group-hover:text-primary-600">
                                                {dx.dx}
                                                {dx.icd_code && <span className="ml-2 text-sm font-normal text-gray-500">({dx.icd_code})</span>}
                                            </h4>
                                        </label>
                                        <span className="font-semibold text-gray-700 flex-shrink-0 ml-4">{Math.round(dx.likelihood * 100)}%</span>
                                    </div>
                                    <LikelihoodBar value={dx.likelihood} />
                                    <blockquote className="mt-3 pl-3 border-l-4 border-primary-200 text-sm text-gray-600 italic">
                                        {dx.rationale}
                                    </blockquote>
                                </div>
                            ))}
                        </div>
                    </SectionCard>

                    <SectionCard 
                        title="Cận lâm sàng gợi ý (Gợi ý từ AI)"
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547a2 2 0 00-.547 1.806l.477 2.387a6 6 0 00.517 3.86l.158.318a6 6 0 00.517 3.86l2.387.477a2 2 0 001.806.547a2 2 0 00.547-1.806l-.477-2.387a6 6 0 00-.517-3.86l-.158-.318a6 6 0 00-.517-3.86l-2.387-.477a2 2 0 00-1.022-.547zM16 4.5v.01M16 4.5a2 2 0 012 2v.01a2 2 0 01-2 2v-.01a2 2 0 01-2-2v-.01a2 2 0 012-2z" /></svg>}
                    >
                         <ul className="space-y-3">
                            {cds.recommended_tests.map((test, index) => (
                                <li key={index} className="p-3 rounded-lg border border-gray-200 flex items-start justify-between">
                                    <div>
                                        <p className="font-semibold text-gray-800">{test.test}</p>
                                        <p className="text-sm text-gray-500">{test.reason}</p>
                                    </div>
                                    <PriorityBadge priority={test.priority} />
                                </li>
                            ))}
                        </ul>
                    </SectionCard>
                </div>
            )}
        </div>
    );
};

export default Tab3_ProvisionalDx;