import { useState, useRef, useCallback } from "react";

export function useCanvasRecorder() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder>(undefined);
  const [recording, setRecording] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const start = useCallback(async (sec: number) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.error("Canvas not found");
      return;
    }
    const stream = canvas.captureStream(60);
    const recorder = new MediaRecorder(stream, {
      mimeType: "video/mp4",
    });
    mediaRecorderRef.current = recorder;
    const chunks: BlobPart[] = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };
    recorder.start();
    setRecording(true);

    setTimeout(() => recorder.stop(), (sec + 1) * 1000);

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: recorder.mimeType });
      setVideoUrl(URL.createObjectURL(blob));
      stream.getTracks().forEach((t) => t.stop());
      setRecording(false);
    };
  }, []);

  const stop = useCallback(() => {
    mediaRecorderRef.current?.stop();
  }, []);

  const reset = useCallback(() => {
    setVideoUrl(null);
    setRecording(false);
  }, []);

  return { canvasRef, recording, videoUrl, start, stop, reset };
}
