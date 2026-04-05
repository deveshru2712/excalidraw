import { LocateFixed, Redo, Undo } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useDrawingStore } from "@/stores/useDrawingStore";

export default function UtilsMenu() {
  const undo = useDrawingStore((state) => state.undo);
  const redo = useDrawingStore((state) => state.redo);
  const setIsPanning = useDrawingStore((state) => state.setIsPanning);

  return (
    <div className="fixed right-2 bottom-2 z-50 flex rounded-md border bg-white p-0.5 shadow">
      <Button onClick={undo} className="cursor-pointer" variant="ghost">
        <Undo className="size-4" />
      </Button>

      <Button
        onClick={() => {
          setIsPanning(true);
        }}
        className="cursor-pointer"
        variant="ghost"
      >
        <LocateFixed className="size-4" />
      </Button>

      <Button onClick={redo} className="cursor-pointer" variant="ghost">
        <Redo className="size-4" />
      </Button>
    </div>
  );
}
