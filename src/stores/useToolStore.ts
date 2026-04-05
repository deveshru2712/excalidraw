import { create } from "zustand";

interface toolsStoreState {
  tool: Tool;
  strokeWidth: number;
  strokeColor: string;
  strokeDash: string;
  fontSize: number;
}

interface toolStoreAction {
  setTool: (tool: Tool) => void;
  setStrokeWidth: (width: number) => void;
  setStrokeColor: (color: string) => void;
  setStrokeStyle: (style: string) => void;
  setFontSize: (size: number) => void;
}

type toolStoreType = toolsStoreState & toolStoreAction;

export const useToolStore = create<toolStoreType>((set) => ({
  tool: "pan",
  strokeWidth: 4,
  strokeColor: "black",
  strokeDash: "solid",
  fontSize: 12,
  setTool: (tool) => set({ tool }),
  setStrokeWidth: (width) => set({ strokeWidth: width }),
  setStrokeColor: (color) => set({ strokeColor: color }),
  setStrokeStyle: (style) => set({ strokeDash: style }),
  setFontSize: (size) => {
    set({ fontSize: size });
  },
}));
