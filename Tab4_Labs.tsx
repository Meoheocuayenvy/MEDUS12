// components/tabs/Tab4_Labs.tsx
import React, { useState } from 'react';
import type { Encounter } from '../../types';

interface Props {
    encounter: Encounter;
    setEncounter: (encounter: Encounter) => void;
}

const SectionCard: React.FC<{title: string; children: React.ReactNode; footer?: React.ReactNode}> = ({title, children, footer}) => (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        </div>
        <div className="p-4">{children}</div>
        {footer && <div className="p-4 bg-gray-50 border-t border-gray-200">{footer}</div>}
    </div>
);

const Tab4_Labs: React.FC<Props> = ({ encounter, setEncounter }) => {
    const [newTest, setNewTest] = useState({ name: '', value: '' });

    const handleClsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewTest(prev => ({ ...prev, [name]: value }));
    };
    
    const addClsResult = () => {
        if (newTest.name && newTest.value) {
            setEncounter({
                ...encounter,
                cls_results: { ...encounter.cls_results, [newTest.name]: newTest.value }
            });
            setNewTest({ name: '', value: '' });
        }
    };
    
    const removeClsResult = (testName: string) => {
        const { [testName]: _, ...rest } = encounter.cls_results || {};
        setEncounter({ ...encounter, cls_results: rest });
    };

    const handleFinalDxChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setEncounter({ ...encounter, dx_final: e.target.value });
    };
    
    const handleAdviceChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setEncounter({ ...encounter, doctor_advice: e.target.value });
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <SectionCard 
                title="Kết quả Cận lâm sàng"
                footer={
                    <div className="flex gap-2 items-center">
                        <input name="name" value={newTest.name} onChange={handleClsChange} placeholder="Tên xét nghiệm" className="flex-grow p-2 border border-gray-300 rounded-md"/>
                        <input name="value" value={newTest.value} onChange={handleClsChange} placeholder="Kết quả" className="w-40 p-2 border border-gray-300 rounded-md"/>
                        <button onClick={addClsResult} className="bg-primary-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors">Thêm</button>
                    </div>
                }
            >
                {Object.keys(encounter.cls_results || {}).length > 0 ? (
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                            <tr>
                                <th scope="col" className="px-4 py-2">Tên xét nghiệm</th>
                                <th scope="col" className="px-4 py-2">Kết quả</th>
                                <th scope="col" className="px-4 py-2 w-16"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(encounter.cls_results || {}).map(([name, value]) => (
                                <tr key={name} className="bg-white border-b">
                                    <th scope="row" className="px-4 py-2 font-medium text-gray-900 whitespace-nowrap">{name}</th>
                                    <td className="px-4 py-2">{String(value)}</td>
                                    <td className="px-4 py-2 text-center">
                                        <button onClick={() => removeClsResult(name)} className="text-gray-400 hover:text-red-500">&times;</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="text-sm text-gray-500 text-center py-4">Chưa có kết quả cận lâm sàng.</p>
                )}
            </SectionCard>

            <SectionCard title="Phân tích Hình ảnh">
                 {/* UI for image upload and analysis would go here */}
                 <p className="text-sm text-gray-500">Chức năng upload hình ảnh đang được phát triển.</p>
            </SectionCard>
             
            <SectionCard title="Chẩn đoán xác định & Kế hoạch">
                 <div className="space-y-4">
                     <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1">Chẩn đoán xác định của Bác sĩ</label>
                         <textarea 
                            value={encounter.dx_final || ''}
                            onChange={handleFinalDxChange}
                            placeholder="Chọn từ danh sách gợi ý ở tab trước hoặc nhập chẩn đoán xác định cuối cùng..."
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                            rows={2}
                        />
                     </div>
                     <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1">Lời khuyên & Kế hoạch điều trị</label>
                         <textarea 
                            value={encounter.doctor_advice || ''}
                            onChange={handleAdviceChange}
                            placeholder="Ghi chú kế hoạch điều trị, lời khuyên cho bệnh nhân..."
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                            rows={4}
                        />
                     </div>
                 </div>
            </SectionCard>
        </div>
    );
};

export default Tab4_Labs;