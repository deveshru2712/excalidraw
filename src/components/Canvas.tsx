import { useDrawingStore } from "@/stores/useDrawingStore";
import { useEffect, useRef } from "react";

export const Canvas = () => {
  const store = useDrawingStore();
  const elements = useDrawingStore((state) => state.elements);
  const addElementRef = useRef(store.addElement);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const isActive = useRef(false);
  const currentPoints = useRef<Point[]>([]);
  const lastPoint = useRef({ x: 0, y: 0 });
  const lastMid = useRef({ x: 0, y: 0 });

  useEffect(() => {
    addElementRef.current = store.addElement;
  }, [store.addElement]);

  function getCoords(e: MouseEvent) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.scale(dpr, dpr);
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "red";
    ctxRef.current = ctx;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseDown = (e: MouseEvent) => {
      const { x, y } = getCoords(e);
      isActive.current = true;
      lastPoint.current = { x, y };
      lastMid.current = { x, y };
      currentPoints.current = [];
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isActive.current) return;
      const ctx = ctxRef.current;
      if (!ctx) return;

      const { x, y } = getCoords(e);

      const currentMid = {
        x: (lastPoint.current.x + x) / 2,
        y: (lastPoint.current.y + y) / 2,
      };

      ctx.beginPath();
      ctx.moveTo(lastMid.current.x, lastMid.current.y);
      ctx.quadraticCurveTo(
        lastPoint.current.x,
        lastPoint.current.y,
        currentMid.x,
        currentMid.y,
      );
      ctx.stroke();

      lastMid.current = currentMid;
      lastPoint.current = { x, y };
      currentPoints.current.push({ x, y });
    };

    const handleMouseUp = () => {
      isActive.current = false;

      if (currentPoints.current.length === 0) return;

      addElementRef.current({
        type: "pencil",
        points: currentPoints.current,
        strokeColor: "red",
        strokeWidth: 2,
      });

      currentPoints.current = [];
    };

    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;

    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

    elements.forEach((element) => {
      if (element.type === "pencil") {
        const points = element.points;
        if (points.length < 2) return;

        ctx.beginPath();
        ctx.strokeStyle = element.strokeColor;
        ctx.lineWidth = element.strokeWidth;

        ctx.moveTo(points[0].x, points[0].y);

        for (let i = 1; i < points.length - 1; i++) {
          const currentMid = {
            x: (points[i].x + points[i + 1].x) / 2,
            y: (points[i].y + points[i + 1].y) / 2,
          };
          ctx.quadraticCurveTo(
            points[i].x,
            points[i].y,
            currentMid.x,
            currentMid.y,
          );
        }

        ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
        ctx.stroke();
      }
    });
  }, [elements]);

  return <canvas ref={canvasRef} className="fixed z-0 bg-neutral-100" />;
};
