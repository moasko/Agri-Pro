import React, { useState, useEffect } from 'react';
import type { Project } from './types';
import Dashboard from './components/Dashboard';
import CreateProjectWizard from './components/CreateProjectWizard';
import ProjectDetails from './components/ProjectDetails';
import { ArrowLeftIcon } from './components/Icons';

const App: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>(() => {
        const savedProjects = localStorage.getItem('agriProjects');
        return savedProjects ? JSON.parse(savedProjects) : [];
    });
    const [view, setView] = useState<'dashboard' | 'create' | 'details'>('dashboard');
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);

    useEffect(() => {
        localStorage.setItem('agriProjects', JSON.stringify(projects));
    }, [projects]);

    const handleCreateProject = (newProject: Omit<Project, 'id' | 'creationDate'>) => {
        const project: Project = {
            ...newProject,
            id: new Date().toISOString(),
            creationDate: new Date().toLocaleDateString('fr-FR'),
        };
        setProjects(prev => [...prev, project]);
        setView('dashboard');
    };

    const handleSelectProject = (project: Project) => {
        setSelectedProject(project);
        setView('details');
    };
    
    const handleBackToDashboard = () => {
        setView('dashboard');
        setSelectedProject(null);
    };

    const renderContent = () => {
        switch (view) {
            case 'create':
                return <CreateProjectWizard onProjectCreate={handleCreateProject} onCancel={() => setView('dashboard')} />;
            case 'details':
                return selectedProject && <ProjectDetails project={selectedProject} />;
            case 'dashboard':
            default:
                return <Dashboard projects={projects} onNewProject={() => setView('create')} onSelectProject={handleSelectProject} />;
        }
    };
    
    return (
        <div className="bg-gray-50 min-h-screen text-gray-800 antialiased">
            <header className="bg-white/80 backdrop-blur-lg sticky top-0 z-10 border-b border-gray-200">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div className="flex items-center">
                        {view !== 'dashboard' && (
                             <button onClick={handleBackToDashboard} className="mr-3 text-gray-600 hover:text-gray-900 p-2 rounded-full hover:bg-gray-200 transition-colors">
                                <ArrowLeftIcon className="w-6 h-6"/>
                             </button>
                        )}
                         <h1 className="text-2xl sm:text-3xl font-bold text-green-800 tracking-tight">Agri-Pro</h1>
                    </div>
                </div>
            </header>
            <main className="container mx-auto p-4 sm:p-6 lg:p-8">
                {renderContent()}
            </main>
        </div>
    );
};

export default App;