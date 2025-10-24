import React, { useState, useRef, useEffect } from 'react';
import type { Zone, DailyForecast } from '../types';
import { getWeatherForecast } from '../services/weatherService';
import { GridIcon, DrawIcon, TrashIcon, SunIcon, CloudIcon, RainIcon, WaterIcon, CloseIcon } from './Icons';

interface FieldMapProps {
    fieldSizeHectares: number;
    projectId: string;
    latitude?: number;
    longitude?: number;
}

const ZONE_COLORS = [
    'rgba(239, 68, 68, 0.4)',  // red-500
    'rgba(59, 130, 246, 0.4)', // blue-500
    'rgba(245, 158, 11, 0.4)', // amber-500
    'rgba(16, 185, 129, 0.4)', // emerald-500
    'rgba(139, 92, 246, 0.4)' // violet-500
];
const ZONE_BORDER_COLORS = [
    '#b91c1c', // red-700
    '#2563eb', // blue-600
    '#d97706', // amber-600
    '#059669', // emerald-600
    '#7c3aed'  // violet-600
];

const getWeatherIconForTooltip = (condition: DailyForecast['condition']) => {
    switch (condition) {
        case 'Sunny': return <SunIcon className="w-6 h-6 text-yellow-400" />;
        case 'Cloudy': return <CloudIcon className="w-6 h-6 text-gray-400" />;
        case 'Rainy': return <RainIcon className="w-6 h-6 text-blue-400" />;
        case 'Partly Cloudy': return <CloudIcon className="w-6 h-6 text-sky-400" />;
        default: return <SunIcon className="w-6 h-6 text-yellow-400" />;
    }
};

const getMapWeatherIcon = (condition: DailyForecast['condition']) => {
    const className = "w-8 h-8 text-white";
    switch (condition) {
        case 'Sunny': return <SunIcon className={className} />;
        case 'Cloudy': return <CloudIcon className={className} />;
        case 'Rainy': return <RainIcon className={className} />;
        case 'Partly Cloudy': return <CloudIcon className={className} />;
        default: return <SunIcon className={className} />;
    }
};

const FieldMap: React.FC<FieldMapProps> = ({ fieldSizeHectares, projectId, latitude, longitude }) => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const [zones, setZones] = useState<Zone[]>(() => {
        try {
            const savedZones = localStorage.getItem(`agri-zones-${projectId}`);
            return savedZones ? JSON.parse(savedZones) : [];
        } catch (error) {
            console.error("Failed to load zones from localStorage", error);
            return [];
        }
    });
    const [isDrawingMode, setIsDrawingMode] = useState(false);
    const [isDrawing, setIsDrawing] = useState(false);
    const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
    const [currentRect, setCurrentRect] = useState<Omit<Zone, 'id' | 'name' | 'color' | 'borderColor'> | null>(null);
    const [isGridVisible, setIsGridVisible] = useState(false);
    const [forecasts, setForecasts] = useState<DailyForecast[]>([]);
    const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
    const gridSize = 10;

    useEffect(() => {
        try {
            localStorage.setItem(`agri-zones-${projectId}`, JSON.stringify(zones));
        } catch (error) {
            console.error("Failed to save zones to localStorage", error);
        }
    }, [zones, projectId]);

    useEffect(() => {
        if (latitude && longitude) {
            const fetchWeather = async () => {
                const data = await getWeatherForecast(latitude, longitude);
                setForecasts(data);
            };
            fetchWeather();
        }
    }, [latitude, longitude]);

    const getRelativeCoords = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = mapContainerRef.current?.getBoundingClientRect();
        if (!rect) return { x: 0, y: 0 };
        return {
            x: ((e.clientX - rect.left) / rect.width) * 100,
            y: ((e.clientY - rect.top) / rect.height) * 100,
        };
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isDrawingMode) return;
        setSelectedZone(null); // Deselect any zone when starting to draw
        e.preventDefault();
        setIsDrawing(true);
        setStartPoint(getRelativeCoords(e));
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isDrawing || !startPoint) return;
        const currentPoint = getRelativeCoords(e);
        const x = Math.min(startPoint.x, currentPoint.x);
        const y = Math.min(startPoint.y, currentPoint.y);
        const width = Math.abs(startPoint.x - currentPoint.x);
        const height = Math.abs(startPoint.y - currentPoint.y);
        setCurrentRect({ x, y, width, height });
    };

    const handleMouseUp = () => {
        if (!isDrawing || !currentRect || currentRect.width < 1 || currentRect.height < 1) {
            setIsDrawing(false);
            setStartPoint(null);
            setCurrentRect(null);
            return;
        }

        const zoneName = window.prompt("Entrez un nom pour cette zone :");
        if (zoneName && zoneName.trim() !== "") {
            const colorIndex = zones.length % ZONE_COLORS.length;
            const newZone: Zone = {
                id: new Date().toISOString(),
                name: zoneName.trim(),
                ...currentRect,
                color: ZONE_COLORS[colorIndex],
                borderColor: ZONE_BORDER_COLORS[colorIndex],
            };
            setZones(prev => [...prev, newZone]);
        }

        setIsDrawing(false);
        setStartPoint(null);
        setCurrentRect(null);
    };

    const handleClearZones = () => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer toutes les zones dessinées ?")) {
            setZones([]);
            setSelectedZone(null);
        }
    }

    const todaysForecast = forecasts.length > 0 ? forecasts[0] : null;
    const willRainSoon = todaysForecast?.precipitation_chance > 50;
    
    const getWeatherSuggestion = () => {
        if (!todaysForecast) return "Données météo non disponibles pour le moment.";
        const { condition, precipitation_chance, temp_max } = todaysForecast;
        if (precipitation_chance > 60) return `Pluie forte attendue (${precipitation_chance}% de chance). L'irrigation peut être suspendue pour aujourd'hui.`;
        if (temp_max > 35) return `Très forte chaleur (${temp_max}°C). Assurez une irrigation suffisante pour éviter le stress hydrique.`;
        if (condition === 'Sunny' && temp_max > 30) return `Journée ensoleillée et chaude (${temp_max}°C). Surveillez l'humidité du sol.`;
        return "Conditions météo stables. Continuez les opérations comme prévu.";
    };

    return (
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
                <h3 className="text-lg font-bold text-gray-800">Carte du Terrain</h3>
                <div className="flex items-center space-x-2">
                     <button onClick={() => setIsGridVisible(!isGridVisible)} className={`flex items-center space-x-2 px-3 py-2 text-sm font-semibold rounded-lg transition-colors ${isGridVisible ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                        <GridIcon className="w-5 h-5" />
                        <span>Quadrillage</span>
                    </button>
                    <button onClick={() => { setIsDrawingMode(!isDrawingMode); setSelectedZone(null); }} className={`flex items-center space-x-2 px-3 py-2 text-sm font-semibold rounded-lg transition-colors ${isDrawingMode ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                        <DrawIcon className="w-5 h-5" />
                        <span>{isDrawingMode ? 'Arrêter' : 'Dessiner'}</span>
                    </button>
                    {zones.length > 0 && (
                        <button onClick={handleClearZones} className="flex items-center space-x-2 px-3 py-2 text-sm font-semibold rounded-lg transition-colors bg-red-100 text-red-700 hover:bg-red-200">
                            <TrashIcon className="w-5 h-5" />
                            <span>Effacer</span>
                        </button>
                    )}
                </div>
            </div>

            <div className="relative rounded-lg overflow-hidden">
                <div
                    ref={mapContainerRef}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={() => isDrawing && handleMouseUp()}
                    onClick={() => { if (!isDrawingMode) setSelectedZone(null); }}
                    className={`aspect-video w-full bg-green-100 relative border-2 border-green-200 ${isDrawingMode ? 'cursor-crosshair' : ''}`}
                >
                    <div className="absolute inset-0 bg-repeat bg-center opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%2365a30d\' fill-opacity=\'0.4\' fill-rule=\'evenodd\'%3E%3Cpath d=\'M0 40L40 0H20L0 20M40 40V20L20 40\'/%3E%3C/g%3E%3C/svg%3E")' }}></div>

                    <div className="relative w-full h-full flex items-center justify-center pointer-events-none">
                        <div className="text-center">
                            <p className="font-bold text-2xl text-green-800">{fieldSizeHectares} ha</p>
                            <p className="text-sm text-green-700">Représentation schématique</p>
                        </div>
                    </div>

                    {isGridVisible && (
                        <div className="absolute inset-0 grid grid-cols-10 grid-rows-10 pointer-events-none">
                            {Array.from({ length: gridSize * gridSize }).map((_, index) => (
                                <div key={index} className="border border-green-500/20"></div>
                            ))}
                        </div>
                    )}
                    
                    {zones.map(zone => {
                        const isSelected = selectedZone?.id === zone.id;
                        return (
                             <div 
                                key={zone.id}
                                onClick={(e) => { if (!isDrawingMode) { e.stopPropagation(); setSelectedZone(zone); }}}
                                className={`group absolute flex items-center justify-center transition-all duration-200 ${willRainSoon && !isSelected ? 'animate-pulse' : ''} ${!isDrawingMode ? 'cursor-pointer' : ''}`}
                                style={{ 
                                    left: `${zone.x}%`, 
                                    top: `${zone.y}%`, 
                                    width: `${zone.width}%`, 
                                    height: `${zone.height}%`, 
                                    backgroundColor: zone.color,
                                    border: `${isSelected ? '4px' : '2px'} solid ${isSelected ? '#F59E0B' : (willRainSoon ? '#2563eb' : zone.borderColor)}`, 
                                    borderRadius: '4px',
                                    '--pulse-color': '#60a5fa', // blue-400 for pulse
                                    zIndex: isSelected ? 10 : 1,
                                } as React.CSSProperties}
                            >
                                 {todaysForecast && (
                                    <div className="drop-shadow-md pointer-events-none opacity-75 group-hover:scale-110 transition-transform duration-300">
                                        {getMapWeatherIcon(todaysForecast.condition)}
                                    </div>
                                )}
                                <div className="absolute -top-1 left-1/2 -translate-x-1/2 -translate-y-full bg-gray-800 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-30 shadow-lg">
                                    <p className="font-bold text-center text-base">{zone.name}</p>
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-gray-800"></div>
                                </div>
                            </div>
                        );
                    })}

                    {currentRect && (
                        <div className="absolute pointer-events-none" style={{ left: `${currentRect.x}%`, top: `${currentRect.y}%`, width: `${currentRect.width}%`, height: `${currentRect.height}%`, backgroundColor: 'rgba(107, 114, 128, 0.3)', border: '2px dashed #4B5563', borderRadius: '4px' }}></div>
                    )}
                </div>

                {/* Side Panel */}
                <div className={`absolute top-0 right-0 h-full w-full max-w-sm bg-white/80 backdrop-blur-md border-l border-gray-200 shadow-2xl p-6 transition-transform duration-300 ease-in-out z-20 ${selectedZone ? 'translate-x-0' : 'translate-x-full'}`}>
                    {selectedZone && (
                        <div>
                             <button onClick={() => setSelectedZone(null)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 p-1 rounded-full hover:bg-gray-200 transition-colors z-10">
                                <CloseIcon className="w-6 h-6" />
                            </button>
                            <h4 className="text-2xl font-bold text-gray-900 mb-6 pr-8">{selectedZone.name}</h4>
                             <div className="space-y-5">
                                <div>
                                    <p className="text-sm font-semibold text-gray-600 mb-1">TAILLE ESTIMÉE</p>
                                    <p className="text-3xl font-bold text-green-700">
                                        {((selectedZone.width / 100) * (selectedZone.height / 100) * fieldSizeHectares).toFixed(3)} ha
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-600 mb-1">SUGGESTIONS MÉTÉO</p>
                                    <div className="bg-gray-50/80 p-4 rounded-lg border border-gray-200 text-gray-700 font-medium">
                                       {getWeatherSuggestion()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <p className="text-xs text-gray-500 mt-2 text-center">
                {isDrawingMode ? "Cliquez et glissez pour dessiner une zone." : "Cliquez sur une zone pour afficher les détails. Une bordure bleue animée indique une pluie imminente."}
            </p>
            <style>{`
                @keyframes pulse {
                    50% { border-color: var(--pulse-color); }
                }
                .animate-pulse {
                    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
            `}</style>
        </div>
    );
};

export default FieldMap;