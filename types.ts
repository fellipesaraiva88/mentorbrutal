export interface DashboardData {
  fase?: string;
  nível_cognitivo?: number;
  elemento_dominante?: string;
  elemento_secundário?: string;
  score_estimado?: number;
  comando_ativo?: string;
  prazo_dias?: number;
  intensidade?: number;
  tendência?: string;
  padrão_detectado?: string;
  renda_atual?: number;
  clientes_atuais?: number;
  tempo_negócio?: string;
  bloqueio_real?: string;
  respondeu_com?: string;
}

export interface TranscriptionEntry {
  speaker: 'user' | 'saraiva';
  text: string;
}
