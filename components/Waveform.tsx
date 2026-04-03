"use client";

import { useEffect, useRef } from "react";
import { InterviewState } from "@/lib/interviewStateMachine";

export default function Waveform({ state }: { state: InterviewState }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (state !== "LISTENING") {
      // Draw flat line when not listening
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = "#00E5CC";
          ctx.fillRect(0, canvas.height / 2 - 1, canvas.width, 2);
        }
      }
      return;
    }

    const initAudio = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const analyzer = audioCtx.createAnalyser();
        
        analyzer.fftSize = 256;
        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyzer);
        
        audioCtxRef.current = audioCtx;
        analyzerRef.current = analyzer;

        draw();
      } catch (err) {
        console.error("Microphone access denied or failed", err);
      }
    };

    const draw = () => {
      const canvas = canvasRef.current;
      const analyzer = analyzerRef.current;
      if (!canvas || !analyzer) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const bufferLength = analyzer.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const renderFrame = () => {
        animationRef.current = requestAnimationFrame(renderFrame);
        analyzer.getByteFrequencyData(dataArray);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const barWidth = (canvas.width / bufferLength) * 2.5;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = dataArray[i] / 2;
          
          ctx.fillStyle = `rgb(0, ${Math.min(255, 200 + barHeight)}, 204)`;
          ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
          
          x += barWidth + 1;
        }
      };

      renderFrame();
    };

    initAudio();

    return () => {
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
         audioCtxRef.current.close().catch(() => {});
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [state]);

  return (
    <canvas 
      ref={canvasRef} 
      width={300} 
      height={100} 
      className="w-full max-w-sm h-16 rounded-md opacity-80"
    />
  );
}
