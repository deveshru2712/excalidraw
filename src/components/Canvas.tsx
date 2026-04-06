import { useEffect, useRef } from "react";

import { useDrawingStore } from "@/stores/useDrawingStore";
import { useToolStore } from "@/stores/useToolStore";
import ApplyDashedStyle from "@/utils/applyStrokeStyle";
import GetElementsToErase from "@/utils/getElementToErase";
import GetElementToMove from "@/utils/getElementToMove";
import getPanning from "@/utils/getPanning";

export default function Canvas() {
  const drawingStore = useDrawingStore();
  const toolStore = useToolStore();
  const elements = useDrawingStore((state) => state.elements);
  const isPanning = useDrawingStore((state) => state.isPanning);
  const zoomDirection = useDrawingStore((state) => state.zoomDirection);

  const erasedIdsRef = useRef<Set<string>>(new Set());

  // for text element
  const activeInputRef = useRef<HTMLInputElement | null>(null);
  const activeInputPositionRef = useRef<Point>({ x: 0, y: 0 });

  // for drage and move
  const draggedElementIdRef = useRef<string | null>(null);
  const draggedElementSnapShotRef = useRef<Point>({ x: 0, y: 0 });

  // for rectangel element
  const rectangelElementSnapShotRef = useRef<Point>({ x: 0, y: 0 });

  // for circle element
  const circleElmentCenterRef = useRef<Point>({ x: 0, y: 0 });

  // for panning canvas
  const lastPanningSnapShot = useRef<Point>({ x: 0, y: 0 });
  const panningOffset = useRef<Point>({ x: 0, y: 0 });

  // for zooming
  const zoomLevelRef = useRef<number>(1);

  useEffect(() => {
    if (!zoomDirection) return;

    if (zoomDirection === "in") {
      zoomLevelRef.current = Math.min(5, zoomLevelRef.current + 0.1);
    } else {
      zoomLevelRef.current = Math.max(0.1, zoomLevelRef.current - 0.1);
    }

    drawingStore.setZoomLevel(zoomLevelRef.current);
    redraw();
    drawingStore.setZoomDirection(null);
  }, [zoomDirection]);

  function redraw(skipIds: Set<string> = new Set()) {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;

    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    // saving the current state
    ctx.save();
    ctx.translate(panningOffset.current.x, panningOffset.current.y);
    // for zooming
    ctx.scale(zoomLevelRef.current, zoomLevelRef.current);

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
        ApplyDashedStyle(ctx, element.strokeDash, element.strokeWidth);

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
      } else if (element.type === "rectangle") {
        ctx.strokeStyle = element.strokeColor;
        ctx.lineWidth = element.strokeWidth;
        ApplyDashedStyle(ctx, element.strokeDash, element.strokeWidth);
        ctx.strokeRect(
          element.point.x,
          element.point.y,
          element.width,
          element.height
        );
      } else if (element.type === "circle") {
        ctx.strokeStyle = element.strokeColor;
        ctx.lineWidth = element.strokeWidth;
        ApplyDashedStyle(ctx, element.strokeDash, element.strokeWidth);
        ctx.beginPath();
        ctx.arc(
          element.center.x,
          element.center.y,
          element.radius,
          0,
          Math.PI * 2
        );
        ctx.stroke();
        ctx.setLineDash([]);
      }
    });
    ctx.restore();
  }

  const storeRef = useRef({
    tool: toolStore.tool,
    elements: drawingStore.elements,
    addElement: drawingStore.addElement,
    removeElement: drawingStore.removeElements,
    updateElement: drawingStore.updateElement,
    pushToUndoStack: drawingStore.pushToUndoStack,
    isPanning: drawingStore.isPanning,
    setIsPanning: drawingStore.setIsPanning,
    strokeColor: toolStore.strokeColor,
    strokeWidth: toolStore.strokeWidth,
    strokeDash: toolStore.strokeDash,
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
      isPanning: drawingStore.isPanning,
      setIsPanning: drawingStore.setIsPanning,
      strokeColor: toolStore.strokeColor,
      strokeWidth: toolStore.strokeWidth,
      strokeDash: toolStore.strokeDash,
      fontSize: toolStore.fontSize,
    };
  }, [
    toolStore.tool,
    drawingStore.elements,
    drawingStore.addElement,
    drawingStore.removeElements,
    drawingStore.updateElement,
    drawingStore.pushToUndoStack,
    drawingStore.isPanning,
    drawingStore.setIsPanning,
    toolStore.strokeColor,
    toolStore.strokeWidth,
    toolStore.strokeDash,
    toolStore.fontSize,
  ]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const isActive = useRef(false);
  const currentPoints = useRef<Point[]>([]);
  const lastPoint = useRef({ x: 0, y: 0 });
  const lastMid = useRef({ x: 0, y: 0 });

  function focusContent() {
    if (!isPanning) return;
    if (!ctxRef.current || !canvasRef.current) return;

    const res = getPanning(ctxRef.current, storeRef.current.elements);
    const centerX = (res.minX + res.maxX) / 2;
    const centerY = (res.minY + res.maxY) / 2;

    panningOffset.current.x = window.innerWidth / 2 - centerX;
    panningOffset.current.y = window.innerHeight / 2 - centerY;
    redraw();
    storeRef.current.setIsPanning(false);
  }

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

    function resizeCanvas() {
      if (!canvas) return;
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

      redraw();
    }

    resizeCanvas();

    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  const threshold = 8;
  // actual writing and erasing logic
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseDown = (e: MouseEvent) => {
      const { x, y } = getCoords(e);

      const wx = (x - panningOffset.current.x) / zoomLevelRef.current;
      const wy = (y - panningOffset.current.y) / zoomLevelRef.current;

      isActive.current = true;
      const { tool, strokeWidth, strokeColor, addElement } = storeRef.current;

      if (tool === "eraser") {
        const Ex = (x - panningOffset.current.x) / zoomLevelRef.current;
        const Ey = (y - panningOffset.current.y) / zoomLevelRef.current;
        const list = GetElementsToErase(
          ctxRef.current!,
          storeRef.current.elements,
          Ex,
          Ey,
          strokeWidth * 3
        );
        list.forEach((id) => erasedIdsRef.current.add(id));
        redraw(erasedIdsRef.current);
      } else if (tool === "pencil") {
        lastPoint.current = { x: wx, y: wy };
        lastMid.current = { x: wx, y: wy };
        currentPoints.current = [];
      } else if (tool === "text") {
        activeInputPositionRef.current.x = wx;
        activeInputPositionRef.current.y = wy;

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
              point: { x: wx, y: wy },
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
          wx,
          wy,
          threshold
        );

        // saving the dragged element id
        draggedElementIdRef.current = point;
        // saving the dragged element snapshot
        draggedElementSnapShotRef.current = { x: wx, y: wy };
        // updating the undo history
        storeRef.current.pushToUndoStack(storeRef.current.elements);
      } else if (tool === "rectangle") {
        // saving snapshot for rectangle element
        rectangelElementSnapShotRef.current.x = wx;
        rectangelElementSnapShotRef.current.y = wy;
      } else if (tool === "circle") {
        // saving the center snapshot for circle elmenet
        circleElmentCenterRef.current.x = wx;
        circleElmentCenterRef.current.y = wy;
      } else if (tool === "pan") {
        lastPanningSnapShot.current.x = x;
        lastPanningSnapShot.current.y = y;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isActive.current) return;
      const ctx = ctxRef.current;
      if (!ctx) return;

      const { x, y } = getCoords(e);

      const wx = (x - panningOffset.current.x) / zoomLevelRef.current;
      const wy = (y - panningOffset.current.y) / zoomLevelRef.current;

      const { tool, strokeColor, strokeWidth, strokeDash } = storeRef.current;
      if (tool === "pencil") {
        const currentMid = {
          x: (lastPoint.current.x + wx) / 2,
          y: (lastPoint.current.y + wy) / 2,
        };

        ctx.beginPath();
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = strokeWidth;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ApplyDashedStyle(ctx, strokeDash, strokeWidth);
        ctx.moveTo(
          lastMid.current.x * zoomLevelRef.current + panningOffset.current.x,
          lastMid.current.y * zoomLevelRef.current + panningOffset.current.y
        );
        ctx.quadraticCurveTo(
          lastPoint.current.x * zoomLevelRef.current + panningOffset.current.x,
          lastPoint.current.y * zoomLevelRef.current + panningOffset.current.y,
          currentMid.x * zoomLevelRef.current + panningOffset.current.x,
          currentMid.y * zoomLevelRef.current + panningOffset.current.y
        );
        ctx.stroke();

        lastMid.current = currentMid;
        lastPoint.current = { x: wx, y: wy };
        currentPoints.current.push({ x: wx, y: wy });
      } else if (tool === "eraser") {
        const Ex = (x - panningOffset.current.x) / zoomLevelRef.current;
        const Ey = (y - panningOffset.current.y) / zoomLevelRef.current;
        const list = GetElementsToErase(
          ctxRef.current!,
          storeRef.current.elements,
          Ex,
          Ey,
          strokeWidth * 3
        );
        list.forEach((id) => erasedIdsRef.current.add(id));
        redraw(erasedIdsRef.current);
      } else if (tool === "drag") {
        // meaning none element is selected
        if (!draggedElementIdRef.current) return;

        // if the element is selected

        const delta: Point = { x: 0, y: 0 };
        delta.x = wx - draggedElementSnapShotRef.current.x;
        delta.y = wy - draggedElementSnapShotRef.current.y;

        // calling the udpate function
        storeRef.current.updateElement(
          draggedElementIdRef.current,
          delta.x,
          delta.y
        );

        // updating the co ordinates
        draggedElementSnapShotRef.current.x = wx;
        draggedElementSnapShotRef.current.y = wy;
      } else if (tool === "rectangle") {
        if (!ctxRef.current) return;
        const w = wx - rectangelElementSnapShotRef.current.x;
        const h = wy - rectangelElementSnapShotRef.current.y;

        // drawing the reactangle
        redraw();
        ctx.strokeStyle = storeRef.current.strokeColor;
        ctx.lineWidth = storeRef.current.strokeWidth;
        ApplyDashedStyle(
          ctx,
          storeRef.current.strokeDash,
          storeRef.current.strokeWidth
        );
        ctxRef.current.strokeRect(
          rectangelElementSnapShotRef.current.x * zoomLevelRef.current +
            panningOffset.current.x,
          rectangelElementSnapShotRef.current.y * zoomLevelRef.current +
            panningOffset.current.y,
          w * zoomLevelRef.current,
          h * zoomLevelRef.current
        );
      } else if (tool === "circle") {
        if (!ctxRef.current) return;

        const center: Point = { x: 0, y: 0 };

        // calculating the center
        center.x = (circleElmentCenterRef.current.x + wx) / 2;
        center.y = (circleElmentCenterRef.current.y + wy) / 2;

        // calculating the center
        const radius = Math.sqrt(
          (circleElmentCenterRef.current.x - center.x) ** 2 +
            (circleElmentCenterRef.current.y - center.y) ** 2
        );

        redraw();

        ctx.strokeStyle = storeRef.current.strokeColor;
        ctx.lineWidth = storeRef.current.strokeWidth;
        ApplyDashedStyle(
          ctx,
          storeRef.current.strokeDash,
          storeRef.current.strokeWidth
        );

        ctx.beginPath();
        ctx.arc(
          center.x * zoomLevelRef.current + panningOffset.current.x,
          center.y * zoomLevelRef.current + panningOffset.current.y,
          radius * zoomLevelRef.current,
          0,
          Math.PI * 2
        );
        ctx.stroke();
        ctx.setLineDash([]);
      } else if (tool === "pan") {
        // calculating the offset
        const offsetX = x - lastPanningSnapShot.current.x;
        const offsetY = y - lastPanningSnapShot.current.y;

        panningOffset.current.x = panningOffset.current.x + offsetX;
        panningOffset.current.y = panningOffset.current.y + offsetY;

        lastPanningSnapShot.current.x = x;
        lastPanningSnapShot.current.y = y;
        redraw();
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (!isActive.current) return;
      const { x, y } = getCoords(e);

      const wx = (x - panningOffset.current.x) / zoomLevelRef.current;
      const wy = (y - panningOffset.current.y) / zoomLevelRef.current;

      isActive.current = false;
      const {
        tool,
        addElement,
        removeElement,
        strokeColor,
        strokeWidth,
        strokeDash,
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
          strokeDash,
        });
        currentPoints.current = [];
      } else if (tool === "drag") {
        // resetting the dragged element
        draggedElementIdRef.current = null;
        draggedElementSnapShotRef.current = { x: 0, y: 0 };
      } else if (tool === "rectangle") {
        // calling the add  function to add the rectangle to update
        addElement({
          id: crypto.randomUUID(),
          type: "rectangle",
          point: {
            x: rectangelElementSnapShotRef.current.x,
            y: rectangelElementSnapShotRef.current.y,
          },
          height: wy - rectangelElementSnapShotRef.current.y,
          width: wx - rectangelElementSnapShotRef.current.x,
          strokeColor,
          strokeWidth,
          strokeDash,
        });
        // reseting the rectangle snapshot
        rectangelElementSnapShotRef.current.x = 0;
        rectangelElementSnapShotRef.current.y = 0;
      } else if (tool === "circle") {
        const center: Point = { x: 0, y: 0 };

        // calculating the center
        center.x = (circleElmentCenterRef.current.x + wx) / 2;
        center.y = (circleElmentCenterRef.current.y + wy) / 2;

        // calculating the center
        const radius = Math.sqrt(
          (circleElmentCenterRef.current.x - center.x) ** 2 +
            (circleElmentCenterRef.current.y - center.y) ** 2
        );

        addElement({
          id: crypto.randomUUID(),
          type: "circle",
          center: {
            x: center.x,
            y: center.y,
          },
          radius,
          strokeColor,
          strokeWidth,
          strokeDash,
        });

        // reseting the circle ref
        circleElmentCenterRef.current.x = 0;
        circleElmentCenterRef.current.y = 0;
      } else if (tool === "pan") {
        // redraw();
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
    if (isPanning) focusContent();
  }, [isPanning]);

  useEffect(() => {
    redraw();
  }, [elements]);

  return <canvas ref={canvasRef} className="cursor-none bg-neutral-100" />;
}
