import React from 'react';
import { AuthProvider, useAuth } from './store/AuthProvider';
import { AppProvider, useApp } from './store/AppProvider';
import { Layout } from './components/Layout';
import { ProjectList } from './components/ProjectList';
import { LoginPage } from './components/LoginPage';
import { ArrowLeft, LogOut, Loader2 } from 'lucide-react';
import 'reactflow/dist/style.css';

const Main: React.FC = () => {
  const { user, logout } = useAuth();
  const { currentProjectId, backToMenu, currentProject, loading } = useApp();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!currentProjectId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <h1 className="font-bold text-gray-700">Lab Flow Chart</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">{user?.email}</span>
            <button
              onClick={logout}
              className="flex items-center gap-1 text-gray-500 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors text-sm"
            >
              <LogOut className="w-4 h-4" />
              ログアウト
            </button>
          </div>
        </div>
        <ProjectList />
      </div>
    );
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
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{user?.email}</span>
          <button
            onClick={logout}
            className="flex items-center gap-1 text-gray-500 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors text-sm"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden">
        <Layout />
      </div>
    </div>
  );
};

const AuthenticatedApp: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <AppProvider>
      <Main />
    </AppProvider>
  );
};

function App() {
  return (
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  );
}

export default App;
