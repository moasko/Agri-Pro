import React from 'react';
import type { Task } from '../types';
import { getTaskColor } from '../constants';

interface TaskTimelineProps {
    tasks: Task[];
    totalDays: number;
}

const TaskTimeline: React.FC<TaskTimelineProps> = ({ tasks, totalDays }) => {
    // Create a legend from the tasks
    const legendItems = tasks.reduce((acc, task) => {
        const lowerCaseTask = task.task.toLowerCase();
        let category = 'Autre';
        let color = 'bg-gray-400';

        if (lowerCaseTask.includes('entretien') || lowerCaseTask.includes('préparation')) {
            category = 'Entretien / Préparation';
            color = 'bg-blue-500';
        } else if (lowerCaseTask.includes('arrosage') || lowerCaseTask.includes('irrigation')) {
            category = 'Irrigation';
            color = 'bg-cyan-400';
        } else if (lowerCaseTask.includes('désherbage')) {
            category = 'Désherbage';
            color = 'bg-yellow-500';
        } else if (lowerCaseTask.includes('traitement') || lowerCaseTask.includes('fertilisation')) {
            category = 'Traitement / Fertilisation';
            color = 'bg-purple-500';
        } else if (lowerCaseTask.includes('récolte')) {
            category = 'Récolte';
            color = 'bg-green-600';
        }

        if (!acc.some(item => item.category === category)) {
            acc.push({ category, color });
        }
        return acc;
    }, [] as { category: string; color: string }[]);


    return (
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Chronologie des Tâches</h3>
            <div className="relative w-full h-8 bg-gray-200 rounded-full">
                {tasks.map((task) => {
                    const left = (task.startDay / totalDays) * 100;
                    const width = ((task.endDay - task.startDay) / totalDays) * 100;
                    const color = getTaskColor(task.task);

                    return (
                        <div
                            key={task.task + task.startDay}
                            className="group absolute h-8 rounded-full transition-transform hover:scale-105 hover:z-10"
                            style={{
                                left: `${left}%`,
                                width: `${width}%`,
                                minWidth: '8px' // ensure even short tasks are visible
                            }}
                        >
                            <div className={`w-full h-full rounded-full opacity-80 ${color}`}></div>
                            {/* Tooltip */}
                            <div className="absolute bottom-full mb-2 w-max max-w-xs p-3 bg-gray-800 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 left-1/2 -translate-x-1/2">
                                <p className="font-bold">{task.task}</p>
                                <p>Jours {task.startDay} - {task.endDay}</p>
                                <p className="text-gray-300 mt-1">{task.description}</p>
                                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-gray-800"></div>
                            </div>
                        </div>
                    );
                })}
            </div>
             <div className="flex items-center justify-between text-sm font-semibold text-gray-500 mt-2 px-1">
                <span>Jour 0</span>
                <span>Jour {totalDays}</span>
            </div>

             {/* Legend */}
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
                {legendItems.map(({ category, color }) => (
                    <div key={category} className="flex items-center">
                        <span className={`w-3 h-3 rounded-full mr-2 ${color}`}></span>
                        <span className="text-xs font-medium text-gray-600">{category}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TaskTimeline;