interface Point {
  x: number;
  y: number;
}

interface DrawingElement {
  type: "pencil";
  points: Point[];
  strokeColor: string;
  strokeWidth: number;
}
