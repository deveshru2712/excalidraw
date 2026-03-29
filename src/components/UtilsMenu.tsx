import { Redo, Undo } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDrawingStore } from "@/stores/useDrawingStore";

export default function UtilsMenu() {
  const undo = useDrawingStore((state) => state.undo);
  const redo = useDrawingStore((state) => state.redo);

  return (
    <div className="fixed bottom-10 left-1/2 flex -translate-x-1/2 rounded-md border p-0.5 shadow">
      <Button onClick={undo} className="cursor-pointer" variant="ghost">
        <Undo className="size-4" />
      </Button>

      <Button className="cursor-pointer" variant="ghost">
        Clear
      </Button>

      <Button onClick={redo} className="cursor-pointer" variant="ghost">
        <Redo className="size-4" />
      </Button>
    </div>
  );
}
