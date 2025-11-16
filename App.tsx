import React from 'react';
import { Controls } from './components/Controls';
import { Dashboard } from './components/Dashboard';
import { TranscriptionLog } from './components/TranscriptionLog';
import { useSaraivaSession } from './hooks/useSaraivaSession';

const App: React.FC = () => {
  const {
    isSessionActive,
    statusMessage,
    dashboardData,
    transcriptionHistory,
    startSession,
    stopSession,
  } = useSaraivaSession();

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans p-4 lg:p-8 flex flex-col">
      <header className="text-center mb-6">
        <h1 className="text-4xl lg:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
          SARAIVA - Mentor Brutal AI
        </h1>
        <p className="text-gray-400 mt-2">
          Mentoria por voz com análise de dados em tempo real.
        </p>
      </header>

      <main className="flex-grow grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
        {/* Main Interaction Area */}
        <div className="lg:col-span-3 flex flex-col bg-gray-800/50 rounded-2xl border border-gray-700 shadow-2xl">
          <div className="flex-grow p-4 min-h-[40vh] lg:min-h-0">
             <TranscriptionLog history={transcriptionHistory} />
          </div>
          <div className="border-t border-gray-700">
            <Controls
              isSessionActive={isSessionActive}
              statusMessage={statusMessage}
              onStart={startSession}
              onStop={stopSession}
            />
          </div>
        </div>

        {/* Dashboard Area */}
        <div className="lg:col-span-2 bg-gray-800/50 rounded-2xl border border-gray-700 shadow-2xl p-4">
          <Dashboard data={dashboardData} />
        </div>
      </main>

       <footer className="text-center mt-8 text-gray-500 text-sm">
        <p>Powered by Google Gemini Live API. This is an AI-driven experience.</p>
      </footer>
    </div>
  );
};

export default App;
