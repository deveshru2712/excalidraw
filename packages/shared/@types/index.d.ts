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

interface RectangleElement {
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
    | RectangleElement
    | CircleElement;

// socket evet types
interface AddEventPayload {
    roomId: string;
    element: DrawingElement;
}

interface RemoveEventPayload {
    roomId: string;
    elementIds: string[];
}

interface UpdateEventPayload {
    roomId: string;
    elementIds: string;
    offsetX: number;
    offsetY: number;
}

interface PushEventPayload {
    roomId: string;
    elements: DrawingElement[];
}

interface SyncEventPayload {
    roomId: string;
    elements: DrawingElement[];
}

interface RequestSyncEventPayload {
    roomId: string;
}

interface PencilPreviewPayload {
    roomId: string;
    strokeId: string;
    type: 'pencil';
    points: Point[];
    strokeColor: string;
    strokeWidth: number;
    strokeDash: string;
}

interface RectanglePreviewPayload {
    roomId: string;
    strokeId: string;
    type: 'rectangle';
    point: Point;
    height: number;
    width: number;
    strokeColor: string;
    strokeWidth: number;
    strokeDash: string;
}

interface CirclePreviewPayload {
    roomId: string;
    strokeId: string;
    type: 'circle';
    center: Point;
    radius: number;
    strokeColor: string;
    strokeWidth: number;
    strokeDash: string;
}

type PreviewPayload =
    | PencilPreviewPayload
    | RectanglePreviewPayload
    | CirclePreviewPayload;
