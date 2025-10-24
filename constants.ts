import type { Crop, SoilType, IrrigationSystem } from './types';
import { ManiocIcon, MaisIcon, IgnamesIcon, RizIcon, CacaoIcon, MaintenanceIcon, WaterIcon, WeedingIcon, TreatmentIcon, HarvestIcon } from './components/Icons';

export const AVAILABLE_CROPS: Crop[] = [
  { name: 'Manioc', icon: ManiocIcon },
  { name: 'Maïs', icon: MaisIcon },
  { name: 'Igname', icon: IgnamesIcon },
  { name: 'Riz', icon: RizIcon },
  { name: 'Cacao', icon: CacaoIcon },
];

export const SOIL_TYPES: SoilType[] = ['Argileux', 'Limoneux', 'Sableux', 'Fertile'];
export const IRRIGATION_SYSTEMS: IrrigationSystem[] = ['Goutte-à-goutte', 'Aspersion', 'Manuel', 'Aucun'];

export const getTaskIcon = (taskName: string) => {
    const lowerCaseTask = taskName.toLowerCase();
    if (lowerCaseTask.includes('entretien') || lowerCaseTask.includes('préparation')) {
        return MaintenanceIcon;
    }
    if (lowerCaseTask.includes('arrosage') || lowerCaseTask.includes('irrigation')) {
        return WaterIcon;
    }
    if (lowerCaseTask.includes('désherbage')) {
        return WeedingIcon;
    }
    if (lowerCaseTask.includes('traitement') || lowerCaseTask.includes('fertilisation')) {
        return TreatmentIcon;
    }
    if (lowerCaseTask.includes('récolte')) {
        return HarvestIcon;
    }
    return MaintenanceIcon;
};

export const getTaskColor = (taskName: string): string => {
    const lowerCaseTask = taskName.toLowerCase();
    if (lowerCaseTask.includes('entretien') || lowerCaseTask.includes('préparation')) {
        return 'bg-blue-500';
    }
    if (lowerCaseTask.includes('arrosage') || lowerCaseTask.includes('irrigation')) {
        return 'bg-cyan-400';
    }
    if (lowerCaseTask.includes('désherbage')) {
        return 'bg-yellow-500';
    }
    if (lowerCaseTask.includes('traitement') || lowerCaseTask.includes('fertilisation')) {
        return 'bg-purple-500';
    }
    if (lowerCaseTask.includes('récolte')) {
        return 'bg-green-600';
    }
    return 'bg-gray-400';
};