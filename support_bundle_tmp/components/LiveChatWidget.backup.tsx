import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, LiveSession, LiveServerMessage, Modality, Blob } from '@google/genai';
import { CloseIcon, MicrophoneIcon } from './icons/Icons';
import { encode, decode, decodeAudioData, createBlob } from '../lib/audioUtils';

interface LiveChatWidgetProps {
  isOpen: boolean;
  onClose: () => void;
}

type TranscriptItem = {
  id: number;
  author: 'user' | 'ai';
  text: string;
};

const LiveChatWidget: React.FC<LiveChatWidgetProps> = ({ isOpen, onClose }) => {
  const [isChatting, setIsChatting] = useState(false);
  const [transcripts, setTranscripts] = useState<TranscriptItem[]>([]);
  
  const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const nextStartTimeRef = useRef(0);
  const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const ai = new GoogleGenAI({apiKey: process.env.API_KEY});

  const stopAudioPlayback = () => {
    for (const source of audioSourcesRef.current.values()) {
        source.stop();
        audioSourcesRef.current.delete(source);
    }
    nextStartTimeRef.current = 0;
  };

  const cleanup = useCallback(() => {
    stopAudioPlayback();
    if (scriptProcessorRef.current) {
        scriptProcessorRef.current.disconnect();
        scriptProcessorRef.current = null;
    }
    if (mediaStreamSourceRef.current) {
        mediaStreamSourceRef.current.disconnect();
        mediaStreamSourceRef.current = null;
    }
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
    }
    if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
        inputAudioContextRef.current.close();
    }
    if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
        outputAudioContextRef.current.close();
    }
    sessionPromiseRef.current = null;
  }, []);

  const endChat = useCallback(async () => {
    setIsChatting(false);
    if (sessionPromiseRef.current) {
        try {
            const session = await sessionPromiseRef.current;
            session.close();
        } catch (e) {
            console.error("Error closing session:", e);
        }
    }
    cleanup();
  }, [cleanup]);

  const startChat = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        setIsChatting(true);
        setTranscripts([]);

        // FIX: Cast window to any to allow access to vendor-prefixed webkitAudioContext for older browsers.
        inputAudioContextRef.current = new ((window as any).AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        outputAudioContextRef.current = new ((window as any).AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

        let currentInput = '';
        let currentOutput = '';
        
        const sessionPromise = ai.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-09-2025',
            callbacks: {
                onopen: () => {
                  const source = inputAudioContextRef.current!.createMediaStreamSource(stream);
                  mediaStreamSourceRef.current = source;
                  const scriptProcessor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
                  scriptProcessorRef.current = scriptProcessor;

                  scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                      const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                      const pcmBlob = createBlob(inputData);
                      sessionPromiseRef.current?.then((session) => {
                          session.sendRealtimeInput({ media: pcmBlob });
                      });
                  };
                  source.connect(scriptProcessor);
                  scriptProcessor.connect(inputAudioContextRef.current!.destination);
                },
                onmessage: async (message: LiveServerMessage) => {
                  if (message.serverContent?.inputTranscription) {
                    currentInput += message.serverContent.inputTranscription.text;
                  }
                  if (message.serverContent?.outputTranscription) {
                    currentOutput += message.serverContent.outputTranscription.text;
                  }
                  if (message.serverContent?.turnComplete) {
                      const finalInput = currentInput;
                      const finalOutput = currentOutput;
                      if(finalInput) {
                        setTranscripts(prev => [...prev, {id: Date.now(), author: 'user', text: finalInput}]);
                      }
                      if(finalOutput) {
                        setTranscripts(prev => [...prev, {id: Date.now() + 1, author: 'ai', text: finalOutput}]);
                      }
                      currentInput = '';
                      currentOutput = '';
                  }
                  
                  const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                  if (audioData) {
                      const outCtx = outputAudioContextRef.current!;
                      nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outCtx.currentTime);
                      const audioBuffer = await decodeAudioData(decode(audioData), outCtx, 24000, 1);
                      const source = outCtx.createBufferSource();
                      source.buffer = audioBuffer;
                      source.connect(outCtx.destination);
                      source.addEventListener('ended', () => {
                          audioSourcesRef.current.delete(source);
                      });
                      source.start(nextStartTimeRef.current);
                      nextStartTimeRef.current += audioBuffer.duration;
                      audioSourcesRef.current.add(source);
                  }
                  if(message.serverContent?.interrupted) {
                    stopAudioPlayback();
                  }
                },
                onerror: (e: ErrorEvent) => {
                  console.error('Live session error:', e);
                  endChat();
                },
                onclose: (e: CloseEvent) => {
                  console.log('Live session closed.');
                  cleanup();
                },
            },
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
                systemInstruction: 'You are a friendly and helpful assistant for the ReloPro Dashboard. You can answer questions about clients, jobs, and operations. Keep your answers concise.',
                inputAudioTranscription: {},
                outputAudioTranscription: {},
            },
        });
        sessionPromiseRef.current = sessionPromise;

    } catch (error) {
        console.error("Failed to start chat:", error);
        setIsChatting(false);
    }
  };

  useEffect(() => {
    return () => {
      endChat();
    };
  }, [endChat]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-full max-w-sm">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl flex flex-col h-[60vh]">
            <header className="flex items-center justify-between p-4 border-b dark:border-gray-700">
                <div className="flex items-center space-x-2">
                    <MicrophoneIcon className="w-5 h-5 text-brand-primary"/>
                    <h2 className="text-lg font-bold">Live AI Assistant</h2>
                </div>
                <button onClick={onClose}><CloseIcon/></button>
            </header>

            <main className="flex-grow p-4 overflow-y-auto space-y-4">
              {transcripts.map(item => (
                <div key={item.id} className={`flex ${item.author === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs px-3 py-2 rounded-lg ${item.author === 'user' ? 'bg-brand-primary text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
                    {item.text}
                  </div>
                </div>
              ))}
               {transcripts.length === 0 && !isChatting && <p className="text-center text-gray-500">Click "Start Chat" to begin.</p>}
            </main>

            <footer className="p-4 border-t dark:border-gray-700 flex items-center justify-center space-x-4">
                <button 
                  onClick={isChatting ? endChat : startChat}
                  className={`px-6 py-2 rounded-lg font-semibold text-white ${isChatting ? 'bg-red-600 hover:bg-red-700' : 'bg-brand-primary hover:bg-brand-secondary'}`}
                >
                    {isChatting ? 'End Chat' : 'Start Chat'}
                </button>
                 {isChatting && (
                    <div className="relative flex items-center justify-center w-8 h-8">
                        <div className="absolute w-full h-full bg-brand-accent rounded-full animate-ping"></div>
                        <div className="relative w-4 h-4 bg-brand-accent rounded-full"></div>
                    </div>
                 )}
            </footer>
        </div>
    </div>
  );
};

export default LiveChatWidget;