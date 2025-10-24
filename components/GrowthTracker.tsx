import React, { useState, useEffect } from 'react';
import { SproutIcon, GrowthIcon, FloweringIcon, HarvestIcon } from './Icons';

interface GrowthTrackerProps {
    creationDate: string;
    totalDays: number;
}

interface GrowthStage {
    name: string;
    threshold: number; // percentage of totalDays
    icon: React.ElementType;
    color: string;
}

const STAGES: GrowthStage[] = [
    { name: 'Germination', threshold: 0, icon: SproutIcon, color: 'text-lime-500' },
    { name: 'Croissance', threshold: 15, icon: GrowthIcon, color: 'text-green-500' },
    { name: 'Floraison', threshold: 60, icon: FloweringIcon, color: 'text-yellow-500' },
    { name: 'Récolte', threshold: 90, icon: HarvestIcon, color: 'text-orange-500' },
];

const GrowthTracker: React.FC<GrowthTrackerProps> = ({ creationDate, totalDays }) => {
    const [daysPassed, setDaysPassed] = useState(0);

    useEffect(() => {
        const parseDate = (dateStr: string): Date => {
            const parts = dateStr.split('/');
            // Assuming dd/mm/yyyy
            return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        };

        const projectStartDate = parseDate(creationDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const timeDiff = today.getTime() - projectStartDate.getTime();
        const currentDaysPassed = Math.floor(timeDiff / (1000 * 3600 * 24));

        setDaysPassed(Math.max(0, Math.min(currentDaysPassed, totalDays)));
    }, [creationDate, totalDays]);

    const progress = totalDays > 0 ? (daysPassed / totalDays) * 100 : 0;
    
    const getCurrentStage = () => {
        let currentStage = STAGES[0];
        for (const stage of STAGES) {
            if (progress >= stage.threshold) {
                currentStage = stage;
            }
        }
        return currentStage;
    };

    const currentStage = getCurrentStage();

    return (
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">Suivi de Croissance</h3>
                <div className="text-right">
                    <p className="font-bold text-gray-800 text-lg">Jour {daysPassed} / {totalDays}</p>
                    <p className={`text-sm font-semibold ${currentStage.color}`}>{currentStage.name}</p>
                </div>
            </div>

            <div className="relative pt-10">
                {/* Progress Bar Background */}
                <div className="relative w-full h-3 bg-gray-200 rounded-full">
                    {/* Animated Progress */}
                    <div
                        className="h-3 bg-green-500 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${progress}%` }}
                    ></div>
                    {/* Current Day Marker */}
                    <div
                        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 bg-white border-4 border-green-600 rounded-full shadow-md"
                        style={{ left: `${progress}%` }}
                    >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs font-bold bg-green-600 text-white px-2 py-0.5 rounded-full">
                            Jour {daysPassed}
                        </div>
                    </div>
                </div>

                {/* Stage Markers */}
                <div className="absolute top-0 w-full flex justify-between items-end h-16">
                    {STAGES.map((stage) => {
                         const isActive = progress >= stage.threshold;
                         return (
                            <div
                                key={stage.name}
                                className="flex flex-col items-center"
                                style={{
                                    position: 'absolute',
                                    left: `${stage.threshold}%`,
                                    transform: 'translateX(-50%)',
                                }}
                            >
                                 <div className={`transition-colors duration-500 ${isActive ? stage.color : 'text-gray-400'}`}>
                                    <stage.icon className="w-8 h-8" />
                                </div>
                                <p className={`text-xs font-semibold mt-1 transition-colors duration-500 ${isActive ? 'text-gray-700' : 'text-gray-400'}`}>{stage.name}</p>
                            </div>
                         );
                    })}
                </div>
            </div>
        </div>
    );
};

export default GrowthTracker;
