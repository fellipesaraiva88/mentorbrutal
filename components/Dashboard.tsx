import React from 'react';
import type { DashboardData } from '../types';

interface DashboardProps {
  data: DashboardData | null;
}

const DataItem: React.FC<{ label: string; value: string | number | undefined }> = ({ label, value }) => {
  if (value === undefined || value === null || value === '') return null;
  return (
    <div className="bg-gray-800 p-3 rounded-lg">
      <p className="text-xs text-blue-400 uppercase font-bold tracking-wider">{label}</p>
      <p className="text-lg text-gray-100 font-medium capitalize">{String(value)}</p>
    </div>
  );
};

const ScoreDisplay: React.FC<{ score: number | undefined }> = ({ score }) => {
    if (score === undefined) return null;
    const circumference = 2 * Math.PI * 45;
    const offset = circumference - (score / 100) * circumference;

    return (
        <div className="bg-gray-800 p-4 rounded-lg flex flex-col items-center justify-center">
            <p className="text-xs text-blue-400 uppercase font-bold tracking-wider mb-2">Score Estimado</p>
            <div className="relative w-28 h-28">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle className="text-gray-700" strokeWidth="10" stroke="currentColor" fill="transparent" r="45" cx="50" cy="50" />
                    <circle
                        className="text-green-500"
                        strokeWidth="10"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                        r="45"
                        cx="50"
                        cy="50"
                        transform="rotate(-90 50 50)"
                    />
                </svg>
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl font-bold">{score}</span>
            </div>
        </div>
    );
};


export const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  return (
    <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 h-full w-full">
      <h2 className="text-2xl font-bold text-gray-100 mb-6 border-b border-gray-700 pb-4">Análise em Tempo Real</h2>
      {data ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DataItem label="Fase da Conversa" value={data.fase} />
          <DataItem label="Nível Cognitivo" value={data.nível_cognitivo} />
          <DataItem label="Elemento Dominante" value={data.elemento_dominante} />
          <DataItem label="Elemento Secundário" value={data.elemento_secundário} />
          <ScoreDisplay score={data.score_estimado} />
          <DataItem label="Intensidade (0-10)" value={data.intensidade} />
          <DataItem label="Comando Ativo" value={data.comando_ativo} />
          <DataItem label="Prazo (dias)" value={data.prazo_dias} />
          <DataItem label="Padrão Detectado" value={data.padrão_detectado} />
          <DataItem label="Bloqueio Real" value={data.bloqueio_real} />
        </div>
      ) : (
        <div className="flex items-center justify-center h-full text-gray-500">
          <p>Aguardando dados da sessão...</p>
        </div>
      )}
    </div>
  );
};
