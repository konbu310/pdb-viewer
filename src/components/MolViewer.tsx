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
import { Input } from "@/components/ui/input.tsx";
import { LoaderCircle, Square, SquareCheck } from "lucide-react";
import { useCanvasRecorder } from "@/hooks/useCanvasRecorder.ts";

export const MolViewer: FC<{ fileName: string; pdbText: string }> = ({
  fileName,
  pdbText,
}) => {
  const [isSpin, setIsSpin] = useState<boolean>(false);
  const [axis, setAxis] = useState<string>("vy");
  const [speed, setSpeed] = useState<number>(1);
  const [canPlay, setCanPlay] = useState<boolean>(false);

  const viewerRef = useRef<any>(null);
  const { canvasRef, recording, reset, start, videoUrl } = useCanvasRecorder();

  const render = useCallback<RefCallback<HTMLDivElement>>(
    (node) => {
      if (!node) return;
      const mol = "$3Dmol" in window ? (window as any)["$3Dmol"] : null;
      const viewer = mol.createViewer(node, {
        canvas: canvasRef.current,
        antialias: true,
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
    },
    [canvasRef, pdbText],
  );

  // カメラ平行移動（パン）
  const panCamera = (dx: number, dy: number) => {
    viewerRef.current?.translate(dx, dy);
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
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowUp") {
        panCamera(0, 20);
      } else if (event.key === "ArrowDown") {
        panCamera(0, -20);
      } else if (event.key === "ArrowLeft") {
        panCamera(-20, 0);
      } else if (event.key === "ArrowRight") {
        panCamera(20, 0);
      } else if (event.key === "z") {
        zoomCamera(1.1);
      } else if (event.key === "x") {
        zoomCamera(0.9);
      } else if (event.key === "r") {
        rotateCamera(10, "x");
      } else if (event.key === "t") {
        rotateCamera(-10, "x");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    if (isSpin) {
      viewer.spin(axis, speed);
    } else {
      viewer.spin(false);
    }
  }, [axis, isSpin, speed]);

  return (
    <div>
      <div ref={render} className="mx-auto relative w-[1024x] h-[768px]">
        <canvas ref={canvasRef} className="border" />
      </div>

      <div className="flex gap-4 mt-4 justify-center items-end">
        <Button variant="outline" onClick={() => setIsSpin((prev) => !prev)}>
          {isSpin ? <SquareCheck /> : <Square />}
          Spin
        </Button>

        <Select name="axis" value={axis} onValueChange={setAxis}>
          <SelectTrigger>
            <SelectValue placeholder="Axis" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="vx">VX</SelectItem>
            <SelectItem value="vy">VY</SelectItem>
            <SelectItem value="vz">VZ</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-1 items-center">
          <Input
            name="speed"
            type="number"
            value={speed}
            onChange={(e) => setSpeed(Math.max(1, e.target.valueAsNumber))}
            className="w-20 appearance-none"
          />
        </div>

        <Button
          variant={videoUrl ? "destructive" : "outline"}
          onClick={() => {
            if (videoUrl) {
              reset();
              setCanPlay(false);
            } else {
              start(5);
            }
          }}
          disabled={!videoUrl && !isSpin}
        >
          {videoUrl ? (
            "Clear"
          ) : recording ? (
            <LoaderCircle className="animate-spin" />
          ) : (
            "Record 5s"
          )}
        </Button>
      </div>

      {videoUrl && (
        <>
          <Button variant="link">
            <a href={videoUrl} download={fileName + ".mp4"}>
              Download
            </a>
          </Button>

          <video
            src={videoUrl}
            controls
            className="ml-auto mr-auto"
            onCanPlay={() => setCanPlay(true)}
            style={{ display: canPlay ? "block" : "none" }}
          />
        </>
      )}
    </div>
  );
};
