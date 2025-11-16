import { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleGenAI, LiveSession, LiveServerMessage, Modality, Blob as GenAiBlob } from '@google/genai';
import { SARAIVA_PROMPT } from '../constants';
import { encode, decode, decodeAudioData } from '../utils/audio';
import type { DashboardData, TranscriptionEntry } from '../types';

const INPUT_SAMPLE_RATE = 16000;
const OUTPUT_SAMPLE_RATE = 24000;
const BUFFER_SIZE = 4096;
const DATA_CAPTURE_REGEX = /\[DADOS_CAPTURA\]([\s\S]*?)\[\/DADOS_CAPTURA\]/s;

export const useSaraivaSession = () => {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Pronto para iniciar a mentoria.');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [transcriptionHistory, setTranscriptionHistory] = useState<TranscriptionEntry[]>([]);
  
  const aiRef = useRef<GoogleGenAI | null>(null);
  const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  
  const currentInputTranscription = useRef('');
  const currentOutputTranscription = useRef('');
  const nextAudioPlaybackTime = useRef(0);
  const audioPlaybackSources = useRef(new Set<AudioBufferSourceNode>());

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      stopSession();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const parseAndSetDashboardData = (text: string) => {
    const match = text.match(DATA_CAPTURE_REGEX);
    if (match && match[1]) {
      try {
        const jsonData = JSON.parse(match[1]);
        setDashboardData(prevData => ({ ...prevData, ...jsonData }));
      } catch (error) {
        console.error('Failed to parse dashboard JSON:', error);
      }
    }
  };

  const startSession = useCallback(async () => {
    if (isSessionActive) return;

    setStatusMessage('Solicitando permissão do microfone...');
    try {
      if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set.");
      }
      aiRef.current = new GoogleGenAI({ apiKey: process.env.API_KEY });

      mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      setStatusMessage('Microfone acessado. Conectando...');

      // FIX: Cast window to `any` to allow access to prefixed `webkitAudioContext` for older browsers.
      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: INPUT_SAMPLE_RATE });
      // FIX: Cast window to `any` to allow access to prefixed `webkitAudioContext` for older browsers.
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: OUTPUT_SAMPLE_RATE });
      nextAudioPlaybackTime.current = outputAudioContextRef.current.currentTime;

      sessionPromiseRef.current = aiRef.current.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          systemInstruction: SARAIVA_PROMPT,
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Charon' } },
          },
        },
        callbacks: {
          onopen: () => {
            const source = inputAudioContextRef.current!.createMediaStreamSource(mediaStreamRef.current!);
            scriptProcessorRef.current = inputAudioContextRef.current!.createScriptProcessor(BUFFER_SIZE, 1, 1);
            
            scriptProcessorRef.current.onaudioprocess = (event: AudioProcessingEvent) => {
              const inputData = event.inputBuffer.getChannelData(0);
              const pcmBlob: GenAiBlob = {
                data: encode(new Uint8Array(new Int16Array(inputData.map(x => x * 32768)).buffer)),
                mimeType: `audio/pcm;rate=${INPUT_SAMPLE_RATE}`,
              };
              sessionPromiseRef.current?.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };

            source.connect(scriptProcessorRef.current);
            scriptProcessorRef.current.connect(inputAudioContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.inputTranscription) {
              currentInputTranscription.current += message.serverContent.inputTranscription.text;
            }
            if (message.serverContent?.outputTranscription) {
              const text = message.serverContent.outputTranscription.text;
              currentOutputTranscription.current += text;
              parseAndSetDashboardData(currentOutputTranscription.current);
            }
            if (message.serverContent?.turnComplete) {
              const fullInput = currentInputTranscription.current.trim();
              const fullOutput = currentOutputTranscription.current.trim();
              
              if(fullInput) setTranscriptionHistory(prev => [...prev, { speaker: 'user', text: fullInput }]);
              if(fullOutput) setTranscriptionHistory(prev => [...prev, { speaker: 'saraiva', text: fullOutput.replace(DATA_CAPTURE_REGEX, '').trim() }]);
              
              currentInputTranscription.current = '';
              currentOutputTranscription.current = '';
            }

            const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData && outputAudioContextRef.current) {
              const ctx = outputAudioContextRef.current;
              nextAudioPlaybackTime.current = Math.max(nextAudioPlaybackTime.current, ctx.currentTime);
              
              const audioBuffer = await decodeAudioData(decode(audioData), ctx, OUTPUT_SAMPLE_RATE, 1);
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(ctx.destination);
              
              source.addEventListener('ended', () => audioPlaybackSources.current.delete(source));
              
              source.start(nextAudioPlaybackTime.current);
              nextAudioPlaybackTime.current += audioBuffer.duration;
              audioPlaybackSources.current.add(source);
            }
             if (message.serverContent?.interrupted) {
                for (const source of audioPlaybackSources.current.values()) {
                    source.stop();
                    audioPlaybackSources.current.delete(source);
                }
                nextAudioPlaybackTime.current = 0;
            }
          },
          onerror: (e: ErrorEvent) => {
            console.error('Session error:', e);
            setStatusMessage(`Erro: ${e.message}`);
            stopSession();
          },
          onclose: () => {
            stopSession();
          },
        },
      });

      await sessionPromiseRef.current;
      setIsSessionActive(true);
      setStatusMessage('Conectado. Pode começar a falar.');
      setDashboardData(null);
      setTranscriptionHistory([]);

    } catch (error) {
      console.error('Failed to start session:', error);
      setStatusMessage(`Falha ao iniciar: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      stopSession(); // Clean up on failure
    }
  }, [isSessionActive]);

  const stopSession = useCallback(() => {
    if (!isSessionActive && !mediaStreamRef.current) return;

    sessionPromiseRef.current?.then(session => session.close()).catch(console.error);
    sessionPromiseRef.current = null;
    
    scriptProcessorRef.current?.disconnect();
    scriptProcessorRef.current = null;

    mediaStreamRef.current?.getTracks().forEach(track => track.stop());
    mediaStreamRef.current = null;
    
    inputAudioContextRef.current?.close().catch(console.error);
    inputAudioContextRef.current = null;
    
    outputAudioContextRef.current?.close().catch(console.error);
    outputAudioContextRef.current = null;

    for (const source of audioPlaybackSources.current.values()) {
        source.stop();
    }
    audioPlaybackSources.current.clear();

    setIsSessionActive(false);
    setStatusMessage('Sessão encerrada.');
  }, [isSessionActive]);

  return {
    isSessionActive,
    statusMessage,
    dashboardData,
    transcriptionHistory,
    startSession,
    stopSession,
  };
};
