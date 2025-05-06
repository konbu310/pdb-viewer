import {
  FC,
  RefCallback,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Button } from "@/components/ui/button.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";

export const MolViewer: FC<{ pdbText: string | null }> = ({ pdbText }) => {
  const [axis, setAxis] = useState<string>("none");
  const [speed, setSpeed] = useState<number>(1);
  const [recording, setRecording] = useState<boolean>(false);
  const [url, setUrl] = useState<string | null>(null);

  const viewerRef = useRef<any>(null);

  const isSpin = axis !== "none";

  const render = useCallback<RefCallback<HTMLDivElement>>(
    (node) => {
      if (!node) return;

      const mol = "$3Dmol" in window ? (window as any)["$3Dmol"] : null;

      const viewer = mol.createViewer(node, {
        backgroundColor: "white",
      });
      viewer.zoomTo();
      viewer.addModel(pdbText, "pdb");
      viewer.setStyle({
        cartoon: {
          colorscheme: { prop: "b", gradient: "roygb", min: 50, max: 90 },
        },
      });
      viewer.zoomTo();
      viewer.render();
      viewerRef.current = viewer;
      viewer.glDOM.style.setProperty("border", "1px solid #ccc");
    },
    [pdbText],
  );

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

  if (!pdbText) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div
        ref={render}
        style={{
          marginInline: "auto",
          position: "relative",
          width: "800px",
          height: "600px",
        }}
      />

      <div
        style={{
          display: "flex",
          gap: "2rem",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Select value={axis} onValueChange={setAxis}>
          <SelectTrigger className="">
            <SelectValue placeholder="Axis" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="vx">X-axis</SelectItem>
            <SelectItem value="vy">Y-axis</SelectItem>
            <SelectItem value="vz">Z-azis</SelectItem>
          </SelectContent>
        </Select>

        <input
          type="number"
          value={speed}
          onChange={(e) => setSpeed(+e.target.value)}
        />

        <Button onClick={handleRecord}>
          {recording ? "Recording..." : "Record"}
        </Button>

        {/* 平行移動 */}
        <div>
          <h3>移動</h3>
          <div style={{ textAlign: "center" }}>
            <Button onClick={() => panCamera(0, 20)}>↑ 上</Button>
            <br />
            <Button onClick={() => panCamera(-20, 0)}>← 左</Button>
            <Button onClick={() => panCamera(20, 0)}>右 →</Button>
            <br />
            <Button onClick={() => panCamera(0, -20)}>↓ 下</Button>
          </div>
        </div>

        {/* 回転 */}
        <div>
          <h3>回転</h3>
          <div style={{ textAlign: "center" }}>
            <Button onClick={() => rotateCamera(10, "x")}>↻ X+10°</Button>
            <Button onClick={() => rotateCamera(-10, "x")}>↺ X-10°</Button>
            <br />
            <Button onClick={() => rotateCamera(10, "y")}>↻ Y+10°</Button>
            <Button onClick={() => rotateCamera(-10, "y")}>↺ Y-10°</Button>
          </div>
        </div>

        {/* ズーム */}
        <div>
          <h3>ズーム</h3>
          <div style={{ textAlign: "center" }}>
            <Button onClick={() => zoomCamera(1.2)}>🔍 拡大</Button>
            <Button onClick={() => zoomCamera(0.8)}>🔎 縮小</Button>
          </div>
        </div>
      </div>

      {url && <video src={url} controls width={800} height={600}></video>}
    </div>
  );
};
