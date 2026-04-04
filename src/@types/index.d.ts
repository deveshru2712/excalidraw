type Tool = "pencil" | "eraser" | "text" | "drag" | "rectangle" | "circle";

interface Point {
  x: number;
  y: number;
}

interface PencilElement {
  id: string;
  type: "pencil";
  points: Point[];
  strokeColor: string;
  strokeWidth: number;
  strokeStyle: string;
}

interface TextElement {
  id: string;
  type: "text";
  point: Point;
  strokeColor: string;
  fontSize: number;
  content: string;
}

type DrawingElement = PencilElement | TextElement;
