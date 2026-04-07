type Tool =
    | 'pencil'
    | 'eraser'
    | 'text'
    | 'drag'
    | 'rectangle'
    | 'circle'
    | 'pan';

interface Point {
    x: number;
    y: number;
}

interface PencilElement {
    id: string;
    type: 'pencil';
    points: Point[];
    strokeColor: string;
    strokeWidth: number;
    strokeDash: string;
}

interface TextElement {
    id: string;
    type: 'text';
    point: Point;
    strokeColor: string;
    fontSize: number;
    content: string;
}

interface RectangelElement {
    id: string;
    type: 'rectangle';
    point: Point;
    height: number;
    width: number;
    strokeColor: string;
    strokeWidth: number;
    strokeDash: string;
}

interface CircleElement {
    id: string;
    type: 'circle';
    center: Point;
    radius: number;
    strokeColor: string;
    strokeWidth: number;
    strokeDash: string;
}

type DrawingElement =
    | PencilElement
    | TextElement
    | RectangelElement
    | CircleElement;

type ExitReason = 'host-ended' | 'self-exit';
