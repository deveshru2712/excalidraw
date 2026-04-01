import { useToolStore } from "@/stores/useToolStore";
import { useEffect, useState } from "react";

export default function CursorOverlay() {
  const tool = useToolStore((state) => state.tool);
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      if (!target.closest("canvas")) {
        setVisible(false);
        return;
      }

      setVisible(true);
      setMouseX(e.clientX);
      setMouseY(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  if (!visible) return null;

  if (tool === "pencil") {
    return (
      <div
        style={{
          position: "fixed",
          left: mouseX - 2,
          top: mouseY - 20,
          pointerEvents: "none",
        }}
      >
        <Pencil />
      </div>
    );
  }

  if (tool === "text") {
    return (
      <div
        style={{
          position: "fixed",
          left: mouseX,
          top: mouseY,
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
        }}
      >
        <Type />
      </div>
    );
  }

  if (tool === "eraser") {
    return (
      <div
        style={{
          position: "fixed",
          left: mouseX,
          top: mouseY,
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
        }}
      >
        <Eraser />
      </div>
    );
  }

  return null;
}

const Pencil = () => {
  return (
    <svg
      style={{ transform: "scaleX(-1)" }}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
    >
      <g transform="rotate(-45, 12, 12)">
        <rect
          x="9"
          y="2"
          width="6"
          height="14"
          rx="1"
          fill="white"
          stroke="black"
          strokeWidth="1.2"
        />
        <polygon
          points="9,16 15,16 12,21"
          fill="#f0c040"
          stroke="black"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        <line x1="9" y1="5" x2="15" y2="5" stroke="black" strokeWidth="1.2" />
        <rect
          x="9"
          y="2"
          width="6"
          height="3"
          rx="1"
          fill="#aaa"
          stroke="black"
          strokeWidth="1.2"
        />
        <line
          x1="12"
          y1="19"
          x2="12"
          y2="21"
          stroke="#333"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
};

// ✅ Proper text cursor (I-beam)
const Type = () => {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24">
      <path
        d="M10 4H14M10 20H14M12 4V20"
        stroke="black"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
};

const Eraser = () => {
  const strokeWidth = useToolStore((state) => state.strokeWidth);
  const size = strokeWidth * 3;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ transform: "translate(-50%, -50%)" }}
    >
      <rect
        x="1"
        y="1"
        width={size - 2}
        height={size - 2}
        rx="2"
        fill="white"
        stroke="black"
        strokeWidth="1.2"
      />
    </svg>
  );
};
