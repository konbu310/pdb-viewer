import "./App.css";
import { useEffect, useRef, useState } from "react";
import "3dmol";

function App() {
  const [isSpin, setIsSpin] = useState<boolean>(true);
  const [axis, setAxis] = useState<string>("vy");
  const [speed, setSpeed] = useState<number>(1);
  const [recording, setRecording] = useState<boolean>(false);
  const [url, setUrl] = useState<string | null>(null);

  const viewerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const render = (text: string) => {
    const mol = "$3Dmol" in window ? (window as any)["$3Dmol"] : null;

    const viewer = mol.createViewer(containerRef.current, {
      backgroundColor: "white",
    });
    viewer.zoomTo();
    viewer.addModel(text, "pdb");
    viewer.setStyle({
      cartoon: {
        colorscheme: { prop: "b", gradient: "roygb", min: 50, max: 90 },
      },
    });
    viewer.zoomTo();
    viewer.render();
    viewer.spin(axis, speed);
    viewerRef.current = viewer;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      render(text);
    };
    reader.readAsText(file);
  };

  const mimeType = "video/webm;codecs=vp9";

  const handleRecord = () => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    setRecording(true);
    const canvas = viewer.glDOM as HTMLCanvasElement;
    const stream = canvas.captureStream(60);
    const recordedChunks: Blob[] = [];
    let recorder: MediaRecorder | null = null;
    recorder = new MediaRecorder(stream, {
      mimeType,
      videoBitsPerSecond: 5_000_000,
    });
    recordedChunks.length = 0;
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };
    recorder.onstop = async () => {
      console.log(recordedChunks[0]);
      const blob = new Blob(recordedChunks, { type: recordedChunks[0].type });
      const url = URL.createObjectURL(blob);
      setUrl(url);
    };
    recorder.start();

    window.setTimeout(() => {
      recorder.stop();
      setRecording(false);
    }, 5000);
  };

  // カメラ平行移動（パン）
  const panCamera = (dx: number, dy: number) => {
    // NOTE: yの正方向が上（CanvasのY軸とは逆）
    viewerRef.current?.translate(dx, -dy);
    viewerRef.current?.render();
  };

  // カメラ回転
  const rotateCamera = (angle: number, axis: "x" | "y") => {
    viewerRef.current?.rotate(angle, axis);
    viewerRef.current?.render();
  };

  // ズーム（倍率を掛ける）
  const zoomCamera = (factor: number) => {
    viewerRef.current?.zoom(factor);
    viewerRef.current?.render();
  };

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    if (isSpin) {
      viewer.spin(axis, speed);
    } else {
      viewer.spin(false);
    }
  }, [isSpin, axis, speed]);

  return (
    <div>
      <input type="file" onChange={handleFileChange} />

      <button onClick={() => setIsSpin((p) => !p)}>Spin</button>

      <select onChange={(e) => setAxis(e.target.value)}>
        <option value="vy">vy</option>
        <option value="vx">vx</option>
        <option value="vz">vz</option>
      </select>

      <input
        type="number"
        value={speed}
        onChange={(e) => setSpeed(+e.target.value)}
      />

      <button onClick={handleRecord}>
        {recording ? "Recording..." : "Record"}
      </button>

      <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
        {/* 平行移動 */}
        <div>
          <h3>移動</h3>
          <div style={{ textAlign: "center" }}>
            <button onClick={() => panCamera(0, 20)}>↑ 上</button>
            <br />
            <button onClick={() => panCamera(-20, 0)}>← 左</button>
            <button onClick={() => panCamera(20, 0)}>右 →</button>
            <br />
            <button onClick={() => panCamera(0, -20)}>↓ 下</button>
          </div>
        </div>

        {/* 回転 */}
        <div>
          <h3>回転</h3>
          <div style={{ textAlign: "center" }}>
            <button onClick={() => rotateCamera(10, "x")}>↻ X+10°</button>
            <button onClick={() => rotateCamera(-10, "x")}>↺ X-10°</button>
            <br />
            <button onClick={() => rotateCamera(10, "y")}>↻ Y+10°</button>
            <button onClick={() => rotateCamera(-10, "y")}>↺ Y-10°</button>
          </div>
        </div>

        {/* ズーム */}
        <div>
          <h3>ズーム</h3>
          <div style={{ textAlign: "center" }}>
            <button onClick={() => zoomCamera(1.2)}>🔍 拡大</button>
            <button onClick={() => zoomCamera(0.8)}>🔎 縮小</button>
          </div>
        </div>
      </div>

      <div
        ref={containerRef}
        style={{
          marginInline: "auto",
          position: "relative",
          width: "800px",
          height: "600px",
        }}
      />

      {url && <video src={url} controls width={800} height={600}></video>}
    </div>
  );
}

export default App;
