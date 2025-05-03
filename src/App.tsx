import "./App.css";
import { useEffect, useRef, useState } from "react";
import "3dmol";

function App() {
  const [isSpin, setIsSpin] = useState<boolean>(true);
  const [axis, setAxis] = useState<string>("vy");
  const [speed, setSpeed] = useState<number>(1);
  const viewerRef = useRef<any>(null);

  const render = (text: string) => {
    const mol = "$3Dmol" in window ? (window as any)["$3Dmol"] : null;

    const viewer = mol.createViewer(document.getElementById("viewer"), {
      backgroundColor: "white",
      width: 1000,
      height: 1000,
      antialias: true,
      preserveDrawingBuffer: true,
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
      <div
        id="viewer"
        style={{ position: "relative", width: "640px", height: "480px" }}
      ></div>
      <input type="file" onChange={handleFileChange} />

      <button onClick={() => setIsSpin((p) => !p)}>Spin</button>

      <select onChange={(e) => setAxis(e.target.value)}>
        <option value="vy">vy</option>
        <option value="vx">vx</option>
        <option value="vz">vz</option>
      </select>

      <input
        type="range"
        min={0}
        max={10}
        step={0.1}
        onChange={(e) => setSpeed(+e.target.value)}
      />
    </div>
  );
}

export default App;
