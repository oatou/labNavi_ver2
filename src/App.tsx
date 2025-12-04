import React from 'react';
import { AppProvider, useApp } from './store/AppProvider';
import { Layout } from './components/Layout';
import { ProjectList } from './components/ProjectList';
import { ArrowLeft } from 'lucide-react';
import 'reactflow/dist/style.css';

const Main: React.FC = () => {
  const { currentProjectId, backToMenu, currentProject } = useApp();

  if (!currentProjectId) {
    return <ProjectList />;
  }

  return (
    <div className="relative h-screen flex flex-col">
      {/* Project Header Bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-4">
          <button
            onClick={backToMenu}
            className="flex items-center gap-1 text-gray-500 hover:text-gray-800 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors text-sm font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            一覧に戻る
          </button>
          <div className="h-6 w-px bg-gray-200"></div>
          <h1 className="font-bold text-gray-700">{currentProject?.name}</h1>
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden">
        <Layout />
      </div>
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <Main />
    </AppProvider>
  );
}

export default App;
