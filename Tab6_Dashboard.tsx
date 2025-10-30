// components/tabs/Tab6_Dashboard.tsx
import React, { useMemo } from 'react';
import type { PatientRecord } from '../../types';
import TrendChart from '../charts/TrendChart';

interface Props {
  patientRecord: PatientRecord | null;
}

const Tab6_Dashboard: React.FC<Props> = ({ patientRecord }) => {
    if (!patientRecord) {
        return <p className="text-center text-gray-500">Chưa có dữ liệu bệnh nhân.</p>;
    }

    const chartData = useMemo(() => {
        if (patientRecord.encounters.length < 2) return [];

        return patientRecord.encounters.map(enc => {
            const date = new Date(enc.createdAt).toLocaleDateString('vi-VN');
            const dataPoint: { [key: string]: any } = { date };
            
            if (enc.cls_results) {
                for (const [key, value] of Object.entries(enc.cls_results)) {
                    const numValue = parseFloat(String(value));
                    if (!isNaN(numValue)) {
                        dataPoint[key.toUpperCase()] = numValue;
                    }
                }
            }
            if (enc.scores) {
                 for (const [key, value] of Object.entries(enc.scores)) {
                    const numValue = parseFloat(String(value));
                    if (!isNaN(numValue)) {
                        dataPoint[key] = numValue;
                    }
                }
            }

            return dataPoint;
        });
    }, [patientRecord.encounters]);

    const availableMetrics = useMemo(() => {
        if (chartData.length === 0) return [];
        const metrics = new Set<string>();
        chartData.forEach(dataPoint => {
            Object.keys(dataPoint).forEach(key => {
                if (key !== 'date') {
                    metrics.add(key);
                }
            });
        });
        return Array.from(metrics);
    }, [chartData]);


    return (
        <div className="max-w-5xl mx-auto">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Lịch sử khám</h3>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                    {patientRecord.encounters.slice().reverse().map(enc => (
                        <div key={enc.id} className="p-4 border rounded-lg bg-gray-50/80 hover:bg-gray-100 transition-colors">
                            <div className="flex justify-between items-center">
                                <p className="font-semibold text-primary-700">{new Date(enc.createdAt).toLocaleString('vi-VN')}</p>
                                <span className="text-xs font-medium bg-primary-100 text-primary-800 px-2 py-1 rounded-full">{enc.symptoms.system}</span>
                            </div>
                            <p className="mt-1 text-sm text-gray-700">
                                <span className="font-medium">Chẩn đoán:</span> {enc.dx_final || enc.dx_selected?.dx || 'Chưa có'}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900">Biểu đồ Diễn tiến</h3>
                {chartData.length > 0 ? (
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                        {availableMetrics.map(metric => (
                             <div key={metric} className="p-4 border rounded-lg bg-gray-50">
                                <h4 className="font-bold text-center text-gray-700">{metric}</h4>
                                <TrendChart data={chartData} dataKey={metric} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-gray-500 mt-4 text-center py-8">
                        Cần ít nhất 2 lần khám để hiển thị biểu đồ diễn tiến.
                    </p>
                )}
            </div>
        </div>
    );
};

export default Tab6_Dashboard;