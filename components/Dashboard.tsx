import React from 'react';
import type { Project } from '../types';
import { AVAILABLE_CROPS } from '../constants';
import { PlusIcon, CalendarIcon, SoilIcon } from './Icons';

interface DashboardProps {
  projects: Project[];
  onNewProject: () => void;
  onSelectProject: (project: Project) => void;
}

const ProjectCard: React.FC<{ project: Project; onSelect: () => void }> = ({ project, onSelect }) => {
    const cropInfo = AVAILABLE_CROPS.find(c => c.name === project.cropName);
    const Icon = cropInfo ? cropInfo.icon : () => null;

    return (
        <div onClick={onSelect} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg hover:border-green-400 hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col group">
            <div className="p-5 flex-grow">
                <div className="flex items-start justify-between mb-4">
                    <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                        <Icon className="w-8 h-8 text-green-700" />
                    </div>
                     <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">{project.soilType}</span>
                </div>
                
                <h3 className="text-lg font-bold text-gray-900">{project.cropName}</h3>
                <p className="text-gray-500 text-sm mb-5">{project.fieldSizeHectares} Hectare(s)</p>
                
                <div className="space-y-2 text-sm text-gray-600">
                   <div className="flex items-center">
                       <CalendarIcon className="w-4 h-4 text-gray-400 mr-3"/>
                       <span>Créé le: {project.creationDate}</span>
                   </div>
                   <div className="flex items-center">
                       <p className="font-semibold bg-green-100 text-green-800 px-3 py-1 rounded-full w-full text-center">
                           ~ {(project.calculatedData.estimatedYieldPerHectareKg * project.fieldSizeHectares / 1000).toFixed(1)} tonnes
                       </p>
                   </div>
                </div>
            </div>
            <div className="bg-gray-50 group-hover:bg-green-600 text-gray-600 group-hover:text-white text-center py-2.5 font-semibold text-sm transition-colors duration-300 border-t border-gray-200">
                Gérer le projet
            </div>
        </div>
    );
};


const Dashboard: React.FC<DashboardProps> = ({ projects, onNewProject, onSelectProject }) => {
  return (
    <div>
        <h2 className="text-3xl font-bold mb-6 text-gray-800">Mes Projets</h2>
        {projects.length === 0 ? (
            <div className="text-center py-20 px-6 bg-white rounded-lg border-2 border-dashed border-gray-300">
                <h3 className="text-2xl font-semibold text-gray-800">Bienvenue sur Agri-Pro !</h3>
                <p className="text-gray-500 mt-2 mb-8 max-w-md mx-auto">Organisez, analysez et optimisez vos cultures. Commencez par créer votre premier projet agricole.</p>
                <button onClick={onNewProject} className="bg-green-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-green-700 transition-transform transform hover:scale-105 inline-flex items-center">
                    <PlusIcon className="w-5 h-5 mr-2"/>
                    Créer un projet
                </button>
            </div>
        ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {projects.map(p => (
                      <ProjectCard key={p.id} project={p} onSelect={() => onSelectProject(p)} />
                  ))}
                  <button onClick={onNewProject} className="border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 hover:border-green-500 hover:text-green-600 transition-colors duration-300 min-h-[260px]">
                      <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                        <PlusIcon className="w-8 h-8" />
                      </div>
                      <span className="font-semibold text-lg">Nouveau Projet</span>
                  </button>
              </div>
            </>
        )}
    </div>
  );
};

export default Dashboard;