import React, { useState, useEffect } from 'react';
import { MagicLeafIcon } from './Icons';

const LOADING_MESSAGES = [
    "Analyse des conditions du sol...",
    "Consultation des données climatiques locales...",
    "Calcul du rendement optimal...",
    "Évaluation des besoins en eau...",
    "Planification du calendrier des tâches...",
    "Optimisation de la densité des plants...",
    "Finalisation des prévisions personnalisées...",
];

const MagicLoader = ({ cropName }: { cropName: string }) => {
    const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setCurrentMessageIndex(prevIndex => (prevIndex + 1) % LOADING_MESSAGES.length);
        }, 2200);

        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center text-center p-8 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-xl border border-green-200/50 overflow-hidden">
            <div className="relative w-24 h-24 mb-6">
                <div className="absolute inset-0 bg-green-200 rounded-full animate-ping opacity-20"></div>
                <div className="absolute inset-2 bg-green-300 rounded-full animate-ping opacity-20 [animation-delay:0.5s]"></div>
                <div className="relative z-10 bg-white/70 backdrop-blur-sm p-4 rounded-full shadow-lg flex items-center justify-center">
                    <MagicLeafIcon className="w-16 h-16 text-green-600 animate-pulse" />
                </div>
            </div>
            <h3 className="text-2xl font-bold text-green-900 mb-2">IA en action pour votre {cropName}</h3>
            <div className="h-6 overflow-hidden">
                 <p className="text-green-700 transition-all duration-500 ease-in-out" style={{ transform: `translateY(-${currentMessageIndex * 1.5}rem)`}}>
                    {LOADING_MESSAGES.map((msg, index) => (
                        <span key={index} className="block h-6">{msg}</span>
                    ))}
                </p>
            </div>
        </div>
    );
};

export default MagicLoader;