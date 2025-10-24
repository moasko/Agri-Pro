import React, { useState } from 'react';
import type { Project, CalculatedData, Crop, SoilType, IrrigationSystem } from '../types';
import { AVAILABLE_CROPS, SOIL_TYPES, IRRIGATION_SYSTEMS } from '../constants';
import { generateAgriculturalData } from '../services/geminiService';
import MagicLoader from './MagicLoader';
import { AreaIcon, SoilIcon, IrrigationIcon } from './Icons';

interface CreateProjectWizardProps {
  onProjectCreate: (project: Omit<Project, 'id' | 'creationDate'>) => void;
  onCancel: () => void;
}

const CreateProjectWizard: React.FC<CreateProjectWizardProps> = ({ onProjectCreate, onCancel }) => {
    const [step, setStep] = useState(1);
    const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);
    const [fieldSize, setFieldSize] = useState<number>(1);
    const [soilType, setSoilType] = useState<SoilType>(SOIL_TYPES[0]);
    const [irrigationSystem, setIrrigationSystem] = useState<IrrigationSystem>(IRRIGATION_SYSTEMS[0]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [calculatedData, setCalculatedData] = useState<CalculatedData | null>(null);

    const handleSelectCrop = (crop: Crop) => {
        setSelectedCrop(crop);
        setStep(2);
    };
    
    const handleCalculate = async () => {
        if (!selectedCrop || fieldSize <= 0) {
            setError("Veuillez compléter toutes les informations requises.");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const data = await generateAgriculturalData(selectedCrop.name, fieldSize, soilType, irrigationSystem);
            setCalculatedData(data);
            setStep(3);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProject = () => {
        if (!selectedCrop || !calculatedData) return;
        onProjectCreate({
            cropName: selectedCrop.name,
            fieldSizeHectares: fieldSize,
            calculatedData,
            soilType,
            irrigationSystem,
        });
    };
    
    const renderStep = () => {
        switch (step) {
            case 1: // Choose Crop
                return (
                    <div>
                        <h2 className="text-3xl font-bold text-center mb-2 text-gray-800">Choisir une culture</h2>
                        <p className="text-center text-gray-500 mb-10">Sélectionnez le type de culture pour votre projet.</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                            {AVAILABLE_CROPS.map(crop => (
                                <div key={crop.name} onClick={() => handleSelectCrop(crop)} className="flex flex-col items-center p-6 bg-white rounded-xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer border-2 border-gray-200 hover:border-green-500">
                                    <div className="bg-green-50 p-4 rounded-lg border border-green-100 mb-4">
                                        <crop.icon className="w-12 h-12 text-green-700" />
                                    </div>
                                    <span className="font-bold text-lg text-gray-800">{crop.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 2: // Field Details & Parameters
                return (
                     <div className="max-w-lg mx-auto">
                        <h2 className="text-3xl font-bold text-center mb-2 text-gray-800">Détails du Projet</h2>
                        <p className="text-center text-gray-500 mb-8">Entrez les informations sur votre champ pour des prévisions affinées.</p>
                        {loading && selectedCrop ? <MagicLoader cropName={selectedCrop.name} /> : (
                            <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200 space-y-6">
                                <div>
                                    <label htmlFor="fieldSize" className="block text-md font-semibold text-gray-700 mb-3">Taille du terrain (Hectares)</label>
                                    <div className="relative">
                                        <AreaIcon className="w-6 h-6 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"/>
                                        <input type="number" id="fieldSize" value={fieldSize} onChange={e => setFieldSize(parseFloat(e.target.value))} className="w-full text-xl pl-14 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition" min="0.1" step="0.1" />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="soilType" className="block text-md font-semibold text-gray-700 mb-3">Type de Sol</label>
                                    <div className="relative">
                                        <SoilIcon className="w-6 h-6 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"/>
                                        <select id="soilType" value={soilType} onChange={e => setSoilType(e.target.value as SoilType)} className="w-full text-lg pl-14 pr-4 py-3 border-2 border-gray-200 rounded-lg appearance-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition">
                                            {SOIL_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="irrigationSystem" className="block text-md font-semibold text-gray-700 mb-3">Système d'Irrigation</label>
                                    <div className="relative">
                                        <IrrigationIcon className="w-6 h-6 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"/>
                                        <select id="irrigationSystem" value={irrigationSystem} onChange={e => setIrrigationSystem(e.target.value as IrrigationSystem)} className="w-full text-lg pl-14 pr-4 py-3 border-2 border-gray-200 rounded-lg appearance-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition">
                                            {IRRIGATION_SYSTEMS.map(i => <option key={i} value={i}>{i}</option>)}
                                        </select>
                                    </div>
                                </div>
                                {error && <p className="text-red-500 mt-2 text-center">{error}</p>}
                                <div className="mt-6 flex justify-between items-center">
                                    <button onClick={() => setStep(1)} className="text-gray-600 font-semibold py-2 px-4 rounded-lg hover:bg-gray-100 transition">Retour</button>
                                    <button onClick={handleCalculate} className="bg-green-600 text-white font-bold py-3 px-8 rounded-lg shadow-md hover:bg-green-700 transition">Générer le Plan</button>
                                </div>
                            </div>
                        )}
                    </div>
                );
            case 3: // Summary
                if (!calculatedData || !selectedCrop) return null;
                const totalYield = (calculatedData.estimatedYieldPerHectareKg * fieldSize) / 1000; // in tonnes
                return (
                     <div className="max-w-2xl mx-auto">
                        <h2 className="text-3xl font-bold text-center mb-2 text-gray-800">Résumé du Projet</h2>
                        <p className="text-center text-gray-500 mb-8">Voici les prévisions pour votre champ de {fieldSize} ha de {selectedCrop.name}.</p>
                        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 space-y-6">
                             <div className="text-center bg-green-50 p-6 rounded-lg border border-green-200">
                                <p className="text-lg text-green-700 font-semibold">Prévision de Récolte Totale</p>
                                <p className="text-5xl font-bold text-green-900 my-2">{totalYield.toFixed(2)} tonnes</p>
                                <p className="text-green-800">en environ <span className="font-bold">{calculatedData.estimatedGrowthTimeDays} jours</span></p>
                            </div>
                             <div className="mt-8 flex justify-between items-center">
                                <button onClick={() => setStep(2)} className="text-gray-600 font-semibold py-2 px-4 rounded-lg hover:bg-gray-100 transition">Retour</button>
                                <button onClick={handleSaveProject} className="bg-green-600 text-white font-bold py-3 px-8 rounded-lg shadow-md hover:bg-green-700 transition">Sauvegarder le Projet</button>
                            </div>
                        </div>
                    </div>
                );
        }
    };
    
    return (
        <div className="p-4">
            {renderStep()}
        </div>
    );
};

export default CreateProjectWizard;