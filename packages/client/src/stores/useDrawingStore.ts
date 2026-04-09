import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DrawingStoreState {
    elements: DrawingElement[];
    undoStack: DrawingElement[][];
    redoStack: DrawingElement[][];
    isPanning: boolean;
    zoomLevel: number;
    zoomDirection: 'in' | 'out' | null;
}

interface DrawingStoreAction {
    syncCanvas: (element: DrawingElement[]) => void;
    addElement: (element: DrawingElement) => void;
    removeElements: (elementIds: string[]) => void;
    undo: () => void;
    redo: () => void;
    updateElement: (
        elementIds: string,
        offsetX: number,
        offsetY: number,
    ) => void;
    pushToUndoStack: (elements: DrawingElement[]) => void;
    setIsPanning: (isPanning: boolean) => void;
    setZoomLevel: (level: number) => void;
    setZoomDirection: (dir: 'in' | 'out' | null) => void;
}

type DrawingStoreType = DrawingStoreState & DrawingStoreAction;

export const useDrawingStore = create<DrawingStoreType>()(
    persist(
        (set, get) => ({
            elements: [],
            undoStack: [],
            redoStack: [],
            isPanning: false,
            zoomDirection: null,
            zoomLevel: 1,
            setZoomDirection: (dir) => set({ zoomDirection: dir }),
            setZoomLevel: (lvl) => set({ zoomLevel: lvl }),
            setIsPanning: (isPanning) => {
                set({ isPanning });
            },
            // total sync
            syncCanvas: (elements) => {
                set({ elements });
            },
            addElement: (element) => {
                const previous = get().elements;
                set({
                    elements: [...previous, element],
                    undoStack: [...get().undoStack, previous],
                    redoStack: [],
                });
            },

            removeElements: (elementId) => {
                const prev = get().elements;
                const current = get().elements.filter(
                    (elem) => !elementId.includes(elem.id),
                );
                set({
                    elements: current,
                    undoStack: [...get().undoStack, prev],
                    redoStack: [],
                });
            },

            undo: () => {
                const { undoStack, elements, redoStack } = get();
                if (undoStack.length === 0) return;
                const previous = undoStack[undoStack.length - 1];
                set({
                    elements: previous,
                    undoStack: undoStack.slice(0, -1),
                    redoStack: [...redoStack, elements],
                });
            },

            redo: () => {
                const { redoStack, elements, undoStack } = get();
                if (redoStack.length === 0) return;
                const next = redoStack[redoStack.length - 1];
                set({
                    elements: next,
                    redoStack: redoStack.slice(0, -1),
                    undoStack: [...undoStack, elements],
                });
            },
            updateElement: (id, offsetX, offsetY) => {
                const previous = get().elements;
                const current = previous.map((elem) =>
                    elem.id == id
                        ? elem.type === 'text' || elem.type === 'rectangle'
                            ? {
                                  ...elem,
                                  point: {
                                      x: elem.point.x + offsetX,
                                      y: elem.point.y + offsetY,
                                  },
                              }
                            : elem.type === 'circle'
                              ? {
                                    ...elem,
                                    center: {
                                        x: elem.center.x + offsetX,
                                        y: elem.center.y + offsetY,
                                    },
                                }
                              : {
                                    ...elem,
                                    points: elem.points.map((p) => ({
                                        x: p.x + offsetX,
                                        y: p.y + offsetY,
                                    })),
                                }
                        : { ...elem },
                );
                set({ elements: current });
            },
            pushToUndoStack: (stack) => {
                const undostack = get().undoStack;
                set({ undoStack: [...undostack, stack] });
            },
        }),
        {
            name: 'drawing-store',
            partialize: (state) => ({ elements: state.elements }),
        },
    ),
);
