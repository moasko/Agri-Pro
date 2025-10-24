import React from 'react';

export interface Crop {
  name: string;
  // Fix: Use `React.ReactElement` instead of `JSX.Element` to avoid potential
  // issues with TypeScript's global JSX namespace resolution.
  icon: (props: { className?: string }) => React.ReactElement;
}

export interface Task {
  task: string;
  startDay: number;
  endDay: number;
  description: string;
}

export interface CalculatedData {
  estimatedGrowthTimeDays: number;
  estimatedYieldPerHectareKg: number;
  waterNeedsLiterPerHectarePerDay: number;
  laborNeedsHoursPerHectare: number;
  taskCalendar: Task[];
  estimatedPlantsPerHectare: number;
  estimatedBags: number;
}

export type SoilType = 'Argileux' | 'Limoneux' | 'Sableux' | 'Fertile';
export type IrrigationSystem = 'Goutte-à-goutte' | 'Aspersion' | 'Manuel' | 'Aucun';

export interface Project {
  id: string;
  cropName: string;
  fieldSizeHectares: number;
  creationDate: string;
  calculatedData: CalculatedData;
  soilType: SoilType;
  irrigationSystem: IrrigationSystem;
}

// Fix: Add DailyForecast interface for weather data.
export interface DailyForecast {
  date: string;
  day: string;
  temp_max: number;
  temp_min: number;
  precipitation_chance: number;
  condition: 'Sunny' | 'Cloudy' | 'Rainy' | 'Partly Cloudy';
}

export interface Zone {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  borderColor: string;
}
