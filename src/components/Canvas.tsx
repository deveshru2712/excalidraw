import { useEffect, useRef } from "react";

import { useDrawingStore } from "@/stores/useDrawingStore";
import { useToolStore } from "@/stores/useToolStore";
import applyStrokeStyle from "@/utils/ApplyStrokeStyle";
import GetElementsToErase from "@/utils/GetElementToErase";
import GetElementToMove from "@/utils/GetElementToMove";

export default function Canvas() {
  const drawingStore = useDrawingStore();
  const toolStore = useToolStore();
  const elements = useDrawingStore((state) => state.elements);

  const erasedIdsRef = useRef<Set<string>>(new Set());

  const activeInputRef = useRef<HTMLInputElement | null>(null);
  const activeInputPositionRef = useRef<Point>({ x: 0, y: 0 });

  const draggedElementIdRef = useRef<string | null>(null);
  const draggedElementSnapShotRef = useRef<Point>({ x: 0, y: 0 });

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
            currentMid.y
          );
        }

        ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
        ctx.stroke();
        ctx.setLineDash([]);
      } else if (element.type === "text") {
        ctx.font = `${element.fontSize}px 'Shantell Sans'`;
        ctx.fillStyle = element.strokeColor;
        ctx.fillText(element.content, element.point.x, element.point.y);
      }
    });
  }

  const storeRef = useRef({
    tool: toolStore.tool,
    elements: drawingStore.elements,
    addElement: drawingStore.addElement,
    removeElement: drawingStore.removeElements,
    updateElement: drawingStore.updateElement,
    pushToUndoStack: drawingStore.pushToUndoStack,
    strokeColor: toolStore.strokeColor,
    strokeWidth: toolStore.strokeWidth,
    strokeStyle: toolStore.strokeStyle,
    fontSize: toolStore.fontSize,
  });

  // add text if the user prematurely switches tool
  useEffect(() => {
    const { addElement, strokeColor } = storeRef.current;
    const x = activeInputPositionRef.current.x;
    const y = activeInputPositionRef.current.y;
    if (activeInputRef.current && activeInputRef.current.value.length > 0) {
      const id = crypto.randomUUID();
      addElement({
        id,
        type: "text",
        point: { x, y },
        strokeColor,
        fontSize: storeRef.current.fontSize,
        content: activeInputRef.current.value,
      });
    }
    activeInputRef.current?.remove();
    activeInputRef.current = null;
  }, [toolStore.tool]);

  useEffect(() => {
    storeRef.current = {
      tool: toolStore.tool,
      elements: drawingStore.elements,
      addElement: drawingStore.addElement,
      removeElement: drawingStore.removeElements,
      updateElement: drawingStore.updateElement,
      pushToUndoStack: drawingStore.pushToUndoStack,
      strokeColor: toolStore.strokeColor,
      strokeWidth: toolStore.strokeWidth,
      strokeStyle: toolStore.strokeStyle,
      fontSize: toolStore.fontSize,
    };
  }, [
    toolStore.tool,
    drawingStore.elements,
    drawingStore.addElement,
    drawingStore.removeElements,
    drawingStore.updateElement,
    drawingStore.pushToUndoStack,
    toolStore.strokeColor,
    toolStore.strokeWidth,
    toolStore.strokeStyle,
    toolStore.fontSize,
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

  const threshold = 8;
  // actual writing and erasing logic
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseDown = (e: MouseEvent) => {
      const { x, y } = getCoords(e);
      isActive.current = true;
      const { tool, strokeWidth, strokeColor, addElement } = storeRef.current;

      if (tool === "eraser") {
        const list = GetElementsToErase(
          ctxRef.current!,
          storeRef.current.elements,
          x,
          y,
          strokeWidth * 3
        );
        list.forEach((id) => erasedIdsRef.current.add(id));
        redraw(erasedIdsRef.current);
      } else if (tool === "pencil") {
        lastPoint.current = { x, y };
        lastMid.current = { x, y };
        currentPoints.current = [];
      } else if (tool === "text") {
        activeInputPositionRef.current.x = x;
        activeInputPositionRef.current.y = y;

        const inputElem = document.createElement("input");
        activeInputRef.current = inputElem;
        inputElem.style.position = "fixed";
        inputElem.style.left = `${x}px`;
        inputElem.style.top = `${y}px`;
        inputElem.style.color = strokeColor;
        inputElem.style.font = `${storeRef.current.fontSize}px 'Shantell Sans'`;
        document.body.appendChild(inputElem);
        inputElem.addEventListener("mousedown", (e) => {
          e.stopPropagation();
        });
        inputElem.focus();
        setTimeout(() => inputElem.focus(), 0);
        inputElem.addEventListener("keydown", (e: KeyboardEvent) => {
          if (e.key === "Enter") {
            const id = crypto.randomUUID();
            addElement({
              id,
              type: "text",
              point: { x, y },
              strokeColor,
              fontSize: storeRef.current.fontSize,
              content: inputElem.value,
            });
            document.body.removeChild(inputElem);
            activeInputPositionRef.current.x = 0;
            activeInputPositionRef.current.y = 0;
          }
        });
      } else if (tool === "drag") {
        const point = GetElementToMove(
          ctxRef.current!,
          storeRef.current.elements,
          x,
          y,
          threshold
        );

        // saving the dragged element id
        draggedElementIdRef.current = point;
        // saving the dragged element snapshot
        draggedElementSnapShotRef.current = { x, y };
        // updating the undo history
        storeRef.current.pushToUndoStack(storeRef.current.elements);
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
          currentMid.y
        );
        ctx.stroke();

        lastMid.current = currentMid;
        lastPoint.current = { x, y };
        currentPoints.current.push({ x, y });
      } else if (tool === "eraser") {
        const list = GetElementsToErase(
          ctxRef.current!,
          storeRef.current.elements,
          x,
          y,
          strokeWidth * 3
        );
        list.forEach((id) => erasedIdsRef.current.add(id));
        redraw(erasedIdsRef.current);
      } else if (tool === "drag") {
        // meaning none element is selected
        if (!draggedElementIdRef.current) return;

        // if the element is selected

        const delta: Point = { x: 0, y: 0 };
        delta.x = x - draggedElementSnapShotRef.current.x;
        delta.y = y - draggedElementSnapShotRef.current.y;

        // calling the udpate function
        storeRef.current.updateElement(
          draggedElementIdRef.current,
          delta.x,
          delta.y
        );

        // updating the co ordinates
        draggedElementSnapShotRef.current.x = x;
        draggedElementSnapShotRef.current.y = y;
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
      } else if (tool === "pencil") {
        if (currentPoints.current.length === 0) return;
        addElement({
          id: crypto.randomUUID(),
          type: "pencil",
          points: currentPoints.current,
          strokeColor,
          strokeWidth,
          strokeStyle,
        });
        currentPoints.current = [];
      } else if (tool === "drag") {
        // resetting the dragged element
        draggedElementIdRef.current = null;
        draggedElementSnapShotRef.current = { x: 0, y: 0 };
      }
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

  return <canvas ref={canvasRef} className="z-0 cursor-none bg-neutral-100" />;
}
