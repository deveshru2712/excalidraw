import { Minus, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function ZoomMenu() {
  return (
    <div className="fixed bottom-2 left-2 z-50 flex items-center gap-0.5 rounded-md border bg-white p-0.5 shadow">
      <Button className="cursor-pointer" variant="ghost">
        <Minus className="size-4" />
      </Button>

      <div className="text-xs font-semibold">Zoom</div>

      <Button className="cursor-pointer" variant="ghost">
        <Plus className="size-4" />
      </Button>
    </div>
  );
}
