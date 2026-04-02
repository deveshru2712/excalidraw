import { useEffect } from "react";

import { Eraser, Hand, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToolStore } from "@/stores/useToolStore";

const Tools = [
  { id: 1, icon: Pencil, value: "pencil" as const },
  { id: 2, icon: "T", value: "text" as const },
  { id: 3, icon: Eraser, value: "eraser" as const },
  { id: 4, icon: Hand, value: "grab" as const },
];

export default function ToolsMenu() {
  const { tool, setTool } = useToolStore();
  useEffect(() => {
    console.log("here is the selected tool", tool);
  }, [tool]);
  return (
    <div className="fixed top-5 left-1/2 z-50 flex -translate-x-1/2 rounded-md border bg-white p-0.5 shadow">
      {Tools.map((t) => {
        const Icon = t.icon;

        return (
          <Button
            key={t.id}
            onClick={() => setTool(t.value)}
            className={cn("cursor-pointer", tool === t.value && "bg-black/10")}
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
