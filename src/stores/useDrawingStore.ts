import { create } from "zustand";
import { persist } from "zustand/middleware";

interface DrawingStoreState {
  elements: DrawingElement[];
  undoStack: DrawingElement[][];
  redoStack: DrawingElement[][];
}

interface DrawingStoreAction {
  addElement: (element: DrawingElement) => void;
  removeElements: (elementIds: string[]) => void;
  undo: () => void;
  redo: () => void;
}

type DrawingStoreType = DrawingStoreState & DrawingStoreAction;

export const useDrawingStore = create<DrawingStoreType>()(
  persist(
    (set, get) => ({
      elements: [],
      undoStack: [],
      redoStack: [],

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
    }),
    {
      name: "drawing-store",
      partialize: (state) => ({ elements: state.elements }),
    },
  ),
);
