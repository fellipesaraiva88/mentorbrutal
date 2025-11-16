import React from 'react';

interface ControlsProps {
  isSessionActive: boolean;
  statusMessage: string;
  onStart: () => void;
  onStop: () => void;
}

const MicrophoneIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-3" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm-1 4a4 4 0 108 0V4a4 4 0 10-8 0v4zM2.75 9.5a.75.75 0 000 1.5h.5a6.5 6.5 0 0013.5 0h.5a.75.75 0 000-1.5h-.5A6.5 6.5 0 003.25 9.5h-.5z" clipRule="evenodd" />
    </svg>
);

const StopIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-3" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
    </svg>
);


export const Controls: React.FC<ControlsProps> = ({ isSessionActive, statusMessage, onStart, onStop }) => {
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <button
        onClick={isSessionActive ? onStop : onStart}
        className={`flex items-center justify-center text-xl font-bold py-4 px-8 rounded-full transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-opacity-50 ${
          isSessionActive 
          ? 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500' 
          : 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500'
        }`}
      >
        {isSessionActive ? <StopIcon /> : <MicrophoneIcon />}
        {isSessionActive ? 'Encerrar Sessão' : 'Iniciar Sessão'}
      </button>
      <p className="mt-4 text-sm text-gray-400 h-5">{statusMessage}</p>
    </div>
  );
};
