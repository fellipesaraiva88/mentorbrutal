import React, { useRef, useEffect } from 'react';
import type { TranscriptionEntry } from '../types';

interface TranscriptionLogProps {
  history: TranscriptionEntry[];
}

export const TranscriptionLog: React.FC<TranscriptionLogProps> = ({ history }) => {
  const endOfMessagesRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [history]);

  return (
    <div className="w-full h-full bg-gray-900/80 backdrop-blur-sm border border-gray-700 rounded-2xl p-4 flex flex-col">
       <h2 className="text-xl font-bold text-gray-100 mb-4 border-b border-gray-700 pb-2">Transcrição da Sessão</h2>
      <div className="flex-grow overflow-y-auto pr-2 space-y-4">
        {history.length === 0 && (
            <div className="flex items-center justify-center h-full text-gray-500">
                <p>A transcrição aparecerá aqui...</p>
            </div>
        )}
        {history.map((entry, index) => (
          <div
            key={index}
            className={`flex flex-col ${
              entry.speaker === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            <div
              className={`max-w-xl p-3 rounded-xl ${
                entry.speaker === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-gray-700 text-gray-200 rounded-bl-none'
              }`}
            >
              <p className="text-sm font-bold capitalize mb-1">{entry.speaker === 'user' ? 'Você' : 'Saraiva'}</p>
              <p className="text-base">{entry.text}</p>
            </div>
          </div>
        ))}
        <div ref={endOfMessagesRef} />
      </div>
    </div>
  );
};
