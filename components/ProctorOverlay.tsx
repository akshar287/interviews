"use client";

import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import * as faceapi from "face-api.js";

export default function ProctorOverlay() {
  const webcamRef = useRef<Webcam>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);

  useEffect(() => {
    const loadModels = async () => {
      // Assuming models are served from /models
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
        setModelsLoaded(true);
      } catch (e) {
        console.error("Failed to load face-api models", e);
      }
    };
    loadModels();
  }, []);

  useEffect(() => {
    // Detect tab switching
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setWarning("⚠️ Tab switch detected! Please remain on the interview page.");
        setTimeout(() => setWarning(null), 5000);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  useEffect(() => {
    if (!modelsLoaded) return;

    const interval = setInterval(async () => {
      if (webcamRef.current && webcamRef.current.video) {
        const video = webcamRef.current.video;
        if (video.readyState === 4) {
          const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions());
          if (detections.length === 0) {
            setWarning("⚠️ Face not detected! Please face the camera.");
          } else if (detections.length > 1) {
            setWarning("⚠️ Multiple faces detected! You must be alone.");
          } else {
            setWarning(null);
          }
        }
      }
    }, 2000); // Check every 2s

    return () => clearInterval(interval);
  }, [modelsLoaded]);

  return (
    <>
      {warning && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-600 text-white px-6 py-3 rounded-md font-bold shadow-[0_0_20px_rgba(220,38,38,0.5)] animate-pulse">
          {warning}
        </div>
      )}
      
      <div className="fixed bottom-4 right-4 z-40 w-48 h-36 rounded-md overflow-hidden border-2 border-white/20 shadow-lg">
        <Webcam
          ref={webcamRef}
          audio={false}
          className="w-full h-full object-cover"
          mirrored={true}
        />
        {!modelsLoaded && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-xs text-white">
            Loading AI...
          </div>
        )}
      </div>
    </>
  );
}
