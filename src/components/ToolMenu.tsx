import {
  Circle,
  Eraser,
  Hand,
  MousePointerClick,
  Pencil,
  RectangleHorizontal,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToolStore } from "@/stores/useToolStore";

const Tools = [
  { id: 1, icon: Pencil, value: "pencil" as const },
  { id: 2, icon: "T", value: "text" as const },
  { id: 3, icon: Eraser, value: "eraser" as const },
  { id: 4, icon: Hand, value: "drag" as const },
  { id: 5, icon: RectangleHorizontal, value: "rectangle" as const },
  { id: 6, icon: Circle, value: "circle" as const },
  { id: 7, icon: MousePointerClick, value: "pan" as const },
];

export default function ToolsMenu() {
  const { tool, setTool } = useToolStore();

  return (
    <div className="fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 rounded-md border bg-white p-0.5 shadow">
      {Tools.map((t) => {
        const Icon = t.icon;

        return (
          <Button
            key={t.id}
            onClick={() => setTool(t.value)}
            className={cn(
              "cursor-pointer",
              tool === t.value && "bg-blue-500 text-white"
            )}
            variant="ghost"
          >
            {typeof Icon === "string" ? (
              <span className="p-1.25">{Icon}</span>
            ) : (
              <Icon className="size-4" />
            )}
          </Button>
        );
      })}
    </div>
  );
}
