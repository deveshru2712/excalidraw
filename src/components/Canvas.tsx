import { useDrawingStore } from "@/stores/useDrawingStore";
import { useToolStore } from "@/stores/useToolStore";
import { applyStrokeStyle } from "@/utils/applyStrokeStyle";
import { useEffect, useRef } from "react";

export default function Canvas() {
  const drawingStore = useDrawingStore();
  const toolStore = useToolStore();
  const elements = useDrawingStore((state) => state.elements);

  const erasedIdsRef = useRef<Set<string>>(new Set());

  function redraw(skipIds: Set<string> = new Set()) {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;

    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

    storeRef.current.elements.forEach((element) => {
      if (skipIds.has(element.id)) return;

      if (element.type === "pencil") {
        const points = element.points;
        if (points.length < 2) return;

        ctx.beginPath();
        ctx.strokeStyle = element.strokeColor;
        ctx.lineWidth = element.strokeWidth;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        applyStrokeStyle(ctx, element.strokeStyle, element.strokeWidth);

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
        ctx.setLineDash([]);
      }
    });
  }

  const storeRef = useRef({
    tool: toolStore.tool,
    elements: drawingStore.elements,
    addElement: drawingStore.addElement,
    removeElement: drawingStore.removeElements,
    strokeColor: toolStore.strokeColor,
    strokeWidth: toolStore.strokeWidth,
    strokeStyle: toolStore.strokeStyle,
  });

  function getElementsToErase(
    elements: DrawingElement[],
    eraserX: number,
    eraserY: number,
    eraserRadius: number,
  ): string[] {
    const res: string[] = [];
    for (let i = 0; i < elements.length; i++) {
      for (let j = 0; j < elements[i].points.length; j++) {
        const point = elements[i].points[j];
        const isContacted = Math.sqrt(
          (point.x - eraserX) ** 2 + (point.y - eraserY) ** 2,
        );
        if (isContacted < eraserRadius) {
          res.push(elements[i].id);
          break;
        }
      }
    }
    return res;
  }

  useEffect(() => {
    storeRef.current = {
      tool: toolStore.tool,
      elements: drawingStore.elements,
      addElement: drawingStore.addElement,
      removeElement: drawingStore.removeElements,
      strokeColor: toolStore.strokeColor,
      strokeWidth: toolStore.strokeWidth,
      strokeStyle: toolStore.strokeStyle,
    };
  }, [
    toolStore.tool,
    drawingStore.elements,
    drawingStore.addElement,
    drawingStore.removeElements,
    toolStore.strokeColor,
    toolStore.strokeWidth,
    toolStore.strokeStyle,
  ]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const isActive = useRef(false);
  const currentPoints = useRef<Point[]>([]);
  const lastPoint = useRef({ x: 0, y: 0 });
  const lastMid = useRef({ x: 0, y: 0 });

  // helper func to get current coordinate
  function getCoords(e: MouseEvent) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }

  //setting up the canvas
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
    ctx.strokeStyle = "black";
    ctxRef.current = ctx;
  }, []);

  // actual writing and erasing logic
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseDown = (e: MouseEvent) => {
      const { x, y } = getCoords(e);
      isActive.current = true;
      const { tool, strokeWidth } = storeRef.current;

      if (tool === "eraser") {
        const list = getElementsToErase(
          storeRef.current.elements,
          x,
          y,
          strokeWidth * 3,
        );
        list.forEach((id) => erasedIdsRef.current.add(id));
        redraw(erasedIdsRef.current);
      } else if (tool === "pencil") {
        lastPoint.current = { x, y };
        lastMid.current = { x, y };
        currentPoints.current = [];
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isActive.current) return;
      const ctx = ctxRef.current;
      if (!ctx) return;

      const { x, y } = getCoords(e);
      const { tool, strokeColor, strokeWidth, strokeStyle } = storeRef.current;
      if (tool === "pencil") {
        const currentMid = {
          x: (lastPoint.current.x + x) / 2,
          y: (lastPoint.current.y + y) / 2,
        };

        ctx.beginPath();
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = strokeWidth;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        applyStrokeStyle(ctx, strokeStyle, strokeWidth);
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
      } else if (tool === "eraser") {
        const list = getElementsToErase(
          storeRef.current.elements,
          x,
          y,
          strokeWidth * 3,
        );
        list.forEach((id) => erasedIdsRef.current.add(id));
        redraw(erasedIdsRef.current);
      }
    };

    const handleMouseUp = () => {
      isActive.current = false;
      const {
        tool,
        addElement,
        removeElement,
        strokeColor,
        strokeWidth,
        strokeStyle,
      } = storeRef.current;

      if (tool === "eraser") {
        if (erasedIdsRef.current.size === 0) return;
        removeElement([...erasedIdsRef.current]);
        erasedIdsRef.current.clear();
        return;
      }

      if (currentPoints.current.length === 0) return;
      addElement({
        id: crypto.randomUUID(),
        type: tool,
        points: currentPoints.current,
        strokeColor,
        strokeWidth,
        strokeStyle,
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
    redraw();
  }, [elements]);

  return (
    <canvas ref={canvasRef} className="fixed z-0 cursor-none bg-neutral-100" />
  );
}
