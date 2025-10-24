import React, { useState, useEffect } from 'react';
import type { DailyForecast } from '../types';
import { getWeatherForecast } from '../services/weatherService';
import { SunIcon, CloudIcon, RainIcon, WaterIcon } from './Icons';

interface WeatherForecastProps {
    latitude: number;
    longitude: number;
}

const getWeatherIcon = (condition: DailyForecast['condition']) => {
    switch (condition) {
        case 'Sunny':
            return <SunIcon className="w-10 h-10 text-yellow-500" />;
        case 'Cloudy':
            return <CloudIcon className="w-10 h-10 text-gray-500" />;
        case 'Rainy':
            return <RainIcon className="w-10 h-10 text-blue-500" />;
        case 'Partly Cloudy':
            return <CloudIcon className="w-10 h-10 text-sky-500" />;
        default:
            return <SunIcon className="w-10 h-10 text-yellow-500" />;
    }
};

const ForecastCard: React.FC<{ forecast: DailyForecast }> = ({ forecast }) => (
    <div className="flex-shrink-0 w-32 text-center bg-white p-4 rounded-xl shadow-sm border border-gray-200 space-y-1">
        <p className="font-bold text-gray-800 text-md">{forecast.day}</p>
        <div className="flex justify-center items-center h-12 my-1">
            {getWeatherIcon(forecast.condition)}
        </div>
        <p className="text-xl font-bold text-gray-900">{forecast.temp_max}°</p>
        <p className="text-gray-500 text-sm">{forecast.temp_min}°</p>
        <div className="flex items-center justify-center space-x-1 text-blue-600 pt-1">
            <WaterIcon className="w-4 h-4" />
            <span className="text-sm font-semibold">{forecast.precipitation_chance}%</span>
        </div>
    </div>
);

const WeatherForecast: React.FC<WeatherForecastProps> = ({ latitude, longitude }) => {
    const [forecasts, setForecasts] = useState<DailyForecast[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchWeather = async () => {
            try {
                setLoading(true);
                const data = await getWeatherForecast(latitude, longitude);
                setForecasts(data);
            } catch (err) {
                setError('Impossible de charger les données météo.');
            } finally {
                setLoading(false);
            }
        };
        fetchWeather();
    }, [latitude, longitude]);

    if (loading) {
        return (
            <div className="p-6 rounded-xl border border-gray-200 bg-white text-center">
                 <div className="animate-pulse">
                    <p className="font-semibold text-gray-600">Chargement des prévisions météo...</p>
                 </div>
            </div>
        );
    }
    
    if (error) {
         return (
            <div className="p-6 rounded-xl border border-red-200 bg-red-50 text-center">
                <p className="font-semibold text-red-700">{error}</p>
            </div>
        );
    }

    return (
        <div className="p-5 rounded-xl shadow-sm bg-white border border-gray-200">
            <h3 className="text-lg font-bold mb-4 text-gray-800">Prévisions Météo Locales</h3>
            <div className="flex space-x-4 overflow-x-auto pb-2">
                {forecasts.map(forecast => (
                    <ForecastCard key={forecast.date} forecast={forecast} />
                ))}
            </div>
        </div>
    );
};

export default WeatherForecast;