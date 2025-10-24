import React, { useState, useEffect } from 'react';
import type { Project, Task } from '../types';
import { AVAILABLE_CROPS, getTaskIcon } from '../constants';
import { WaterIcon, HarvestIcon, LaborIcon, PlantIcon, CalendarIcon, SoilIcon, IrrigationIcon, BellIcon } from './Icons';
import FieldMap from './FieldMap';
import TaskTimeline from './TaskTimeline';
import WeatherForecast from './WeatherForecast';
import GrowthTracker from './GrowthTracker';

interface ProjectDetailsProps {
    project: Project;
}

const InfoCard: React.FC<{ title: string; value: string; icon: React.ElementType; color: string }> = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-center shadow-sm">
        <div className={`p-3 rounded-lg bg-${color}-100 mr-4`}>
            <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
        <div>
            <p className={`text-sm text-gray-600`}>{title}</p>
            <p className={`text-xl font-bold text-gray-900`}>{value}</p>
        </div>
    </div>
);

const TaskCard: React.FC<{ task: Task }> = ({ task }) => {
    const Icon = getTaskIcon(task.task);
    return (
        <div className="bg-white p-4 rounded-lg border border-gray-200 flex items-start space-x-4 transition-shadow hover:shadow-md">
            <div className="bg-gray-100 p-3 rounded-lg">
                <Icon className="w-6 h-6 text-gray-600"/>
            </div>
            <div>
                <p className="font-bold text-gray-800">{task.task}</p>
                <p className="text-sm text-gray-500 font-medium">Jours {task.startDay} à {task.endDay}</p>
                <p className="text-sm text-gray-600 mt-1">{task.description}</p>
            </div>
        </div>
    );
};

type Tab = 'overview' | 'map' | 'tasks' | 'details';

const ProjectDetails: React.FC<ProjectDetailsProps> = ({ project }) => {
    const [activeTab, setActiveTab] = useState<Tab>('overview');
    const [upcomingTasks, setUpcomingTasks] = useState<Task[]>([]);
    const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
    const [locationError, setLocationError] = useState<string | null>(null);
    
    useEffect(() => {
        const parseDate = (dateStr: string): Date => {
            const parts = dateStr.split('/');
            return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        };

        const projectStartDate = parseDate(project.creationDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const timeDiff = today.getTime() - projectStartDate.getTime();
        const daysPassed = Math.floor(timeDiff / (1000 * 3600 * 24));

        const upcoming = project.calculatedData.taskCalendar.filter(task => {
            const daysUntilStart = task.startDay - daysPassed;
            return daysUntilStart >= 0 && daysUntilStart <= 3;
        });

        setUpcomingTasks(upcoming.sort((a,b) => a.startDay - b.startDay));

    }, [project]);
    
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        lat: position.coords.latitude,
                        lon: position.coords.longitude,
                    });
                    setLocationError(null);
                },
                (error: GeolocationPositionError) => {
                    console.error("Geolocation error:", error);
                    let message: string;
                    switch (error.code) {
                        case 1: // PERMISSION_DENIED
                            message = "Accès refusé. La météo locale ne peut être affichée sans votre autorisation de géolocalisation.";
                            break;
                        case 2: // POSITION_UNAVAILABLE
                            message = "Position indisponible. Impossible de récupérer votre position actuelle. Veuillez réessayer.";
                            break;
                        case 3: // TIMEOUT
                            message = "Le service de géolocalisation a mis trop de temps à répondre. Veuillez réessayer.";
                            break;
                        default:
                            // This is the most robust way to handle the default case.
                            // It explicitly checks if error.message is a string. If not, it provides a generic message.
                            // This completely avoids the possibility of interpolating an object into the string.
                            const errorDetails = typeof error.message === 'string' ? error.message : 'Détails non disponibles.';
                            message = `Une erreur de géolocalisation est survenue: ${errorDetails}`;
                            break;
                    }
                    setLocationError(message);
                }
            );
        } else {
            setLocationError("La géolocalisation n'est pas supportée par votre navigateur.");
        }
    }, []);


    const cropInfo = AVAILABLE_CROPS.find(c => c.name === project.cropName);
    const CropIcon = cropInfo ? cropInfo.icon : () => null;
    const { calculatedData, fieldSizeHectares } = project;

    const totalYieldTonnes = (calculatedData.estimatedYieldPerHectareKg * fieldSizeHectares) / 1000;
    const totalLaborHours = calculatedData.laborNeedsHoursPerHectare * fieldSizeHectares;
    const totalPlants = calculatedData.estimatedPlantsPerHectare * fieldSizeHectares;
    const totalWater = (calculatedData.waterNeedsLiterPerHectarePerDay * fieldSizeHectares * calculatedData.estimatedGrowthTimeDays) / 1000; // in m³

    const renderDaysUntilMessage = (startDay: number): string => {
        const parseDate = (dateStr: string): Date => {
            const parts = dateStr.split('/');
            return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        };
        const projectStartDate = parseDate(project.creationDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const timeDiff = today.getTime() - projectStartDate.getTime();
        const daysPassed = Math.floor(timeDiff / (1000 * 3600 * 24));
        
        const daysUntil = startDay - daysPassed;
        if (daysUntil < 0) return "en retard";
        if (daysUntil === 0) return "commence aujourd'hui";
        if (daysUntil === 1) return "commence dans 1 jour";
        return `commence dans ${daysUntil} jours`;
    };

    const TabButton: React.FC<{tabId: Tab, label: string}> = ({tabId, label}) => (
        <button 
            onClick={() => setActiveTab(tabId)} 
            className={`px-4 py-2 font-semibold text-sm rounded-md transition-colors ${activeTab === tabId ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-gray-200'}`}
        >
            {label}
        </button>
    )

    const renderContent = () => {
        switch(activeTab) {
            case 'overview':
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                            <InfoCard title="Récolte Totale" value={`${totalYieldTonnes.toFixed(2)} t`} icon={HarvestIcon} color="green" />
                            <InfoCard title="Temps de Croissance" value={`${calculatedData.estimatedGrowthTimeDays} jours`} icon={CalendarIcon} color="blue" />
                            <InfoCard title="Main d'oeuvre" value={`${totalLaborHours.toLocaleString('fr-FR')} h`} icon={LaborIcon} color="yellow" />
                            <InfoCard title="Besoins en Eau" value={`${totalWater.toLocaleString('fr-FR')} m³`} icon={WaterIcon} color="cyan" />
                        </div>
                        
                        <GrowthTracker 
                            creationDate={project.creationDate} 
                            totalDays={calculatedData.estimatedGrowthTimeDays}
                        />

                        <div>
                             {!location && !locationError && (
                                <div className="p-4 text-center bg-gray-100 rounded-lg">
                                    <p className="font-semibold text-gray-700">Récupération de votre position pour la météo...</p>
                                </div>
                            )}
                            {locationError && (
                                <div className="p-4 text-center bg-red-50 text-red-700 rounded-lg">
                                    <p className="font-semibold">{locationError}</p>
                                </div>
                            )}
                            {location && <WeatherForecast latitude={location.lat} longitude={location.lon} />}
                        </div>
                    </div>
                );
            case 'map':
                return <FieldMap projectId={project.id} fieldSizeHectares={fieldSizeHectares} latitude={location?.lat} longitude={location?.lon} />;
            case 'tasks':
                 return (
                    <div>
                        <TaskTimeline tasks={calculatedData.taskCalendar} totalDays={calculatedData.estimatedGrowthTimeDays} />
                        <div className="mt-6 space-y-4">
                            <h3 className="text-lg font-bold text-gray-800">Détails du Calendrier</h3>
                            {calculatedData.taskCalendar.sort((a,b) => a.startDay - b.startDay).map(task => (
                                <TaskCard key={`${task.task}-${task.startDay}`} task={task} />
                            ))}
                        </div>
                    </div>
                 );
            case 'details':
                return (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <h3 className="text-lg font-bold mb-4 text-gray-800">Paramètres du Champ</h3>
                            <div className="space-y-3">
                                 <div className="flex items-center justify-between text-md">
                                    <span className="text-gray-600 flex items-center"><SoilIcon className="w-5 h-5 mr-3 text-yellow-700"/>Type de sol</span>
                                    <span className="font-bold text-gray-800 bg-gray-100 px-3 py-1 rounded">{project.soilType}</span>
                                </div>
                                <div className="flex items-center justify-between text-md">
                                    <span className="text-gray-600 flex items-center"><IrrigationIcon className="w-5 h-5 mr-3 text-blue-500"/>Système d'irrigation</span>
                                    <span className="font-bold text-gray-800 bg-gray-100 px-3 py-1 rounded">{project.irrigationSystem}</span>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <h3 className="text-lg font-bold mb-4 text-gray-800">Estimations Détaillées</h3>
                            <div className="space-y-3">
                                 <div className="flex items-center justify-between text-md">
                                    <span className="text-gray-600 flex items-center"><PlantIcon className="w-5 h-5 mr-3 text-green-600"/>Densité de plantation</span>
                                    <span className="font-bold text-gray-800">{calculatedData.estimatedPlantsPerHectare.toLocaleString('fr-FR')} / ha</span>
                                </div>
                                 <div className="flex items-center justify-between text-md">
                                    <span className="text-gray-600 flex items-center"><PlantIcon className="w-5 h-5 mr-3 text-green-600"/>Total de plants</span>
                                    <span className="font-bold text-gray-800">{totalPlants.toLocaleString('fr-FR')}</span>
                                </div>
                                <div className="flex items-center justify-between text-md">
                                    <span className="text-gray-600 flex items-center"><HarvestIcon className="w-5 h-5 mr-3 text-yellow-600"/>Sacs de 50kg</span>
                                    <span className="font-bold text-gray-800">~ {calculatedData.estimatedBags.toLocaleString('fr-FR')}</span>
                                </div>
                            </div>
                        </div>
                     </div>
                );
        }
    }

    return (
        <div className="space-y-6">
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex flex-col sm:flex-row items-start justify-between">
                    <div>
                        <p className="text-sm font-semibold text-green-700">{project.cropName}</p>
                        <h2 className="text-3xl font-bold text-gray-900">{project.fieldSizeHectares} Hectare(s)</h2>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-100 mt-4 sm:mt-0">
                        <CropIcon className="w-10 h-10 text-green-700" />
                    </div>
                </div>
            </div>

            {upcomingTasks.length > 0 && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg shadow-sm">
                    <div className="flex">
                        <div className="py-1">
                            <BellIcon className="h-6 w-6 text-yellow-500 mr-4"/>
                        </div>
                        <div>
                            <p className="font-bold text-yellow-800">Tâches à venir</p>
                            <ul className="list-disc pl-5 mt-1 space-y-1">
                                {upcomingTasks.map(task => (
                                    <li key={task.task + task.startDay} className="text-yellow-700 text-sm">
                                       <span className="font-semibold">{task.task}</span>: {renderDaysUntilMessage(task.startDay)}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}
            
            <div className="bg-white p-2 rounded-lg border border-gray-200 shadow-sm flex items-center space-x-2">
                <TabButton tabId="overview" label="Synthèse" />
                <TabButton tabId="map" label="Carte du Terrain" />
                <TabButton tabId="tasks" label="Plan de Tâches" />
                <TabButton tabId="details" label="Détails Avancés" />
            </div>

            <div className="mt-6">
                {renderContent()}
            </div>

        </div>
    );
};

export default ProjectDetails;