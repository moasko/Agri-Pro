import type { DailyForecast } from '../types';

// This is a mock weather service. In a real application, you would
// replace this with a call to a real weather API like OpenWeatherMap,
// WeatherAPI.com, etc.
export const getWeatherForecast = async (latitude: number, longitude: number): Promise<DailyForecast[]> => {
    console.log(`Fetching weather for Lat: ${latitude}, Lon: ${longitude}`);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Generate mock data for the next 5 days
    const forecasts: DailyForecast[] = [];
    const today = new Date();
    const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const conditions: Array<'Sunny' | 'Cloudy' | 'Rainy' | 'Partly Cloudy'> = ['Sunny', 'Partly Cloudy', 'Rainy', 'Cloudy'];

    for (let i = 0; i < 5; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        
        // Mock data logic - this is deterministic for demonstration
        const temp_max = 30 + (latitude % 5) - i;
        const temp_min = 22 + (longitude % 4) - i;
        const precipitation_chance = ( (latitude + longitude + i*10) % 80);
        const condition = conditions[Math.floor((latitude + i) % conditions.length)];
        
        forecasts.push({
            date: date.toISOString().split('T')[0],
            day: days[date.getDay()],
            temp_max: Math.round(temp_max),
            temp_min: Math.round(temp_min),
            precipitation_chance: Math.round(precipitation_chance),
            condition: precipitation_chance > 50 ? 'Rainy' : condition,
        });
    }

    return forecasts;
};
