import { Minus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useToolStore } from "@/stores/useToolStore";

const strokeSettingConfig = {
  pencil: {
    stroke: ["black", "red", "green", "blue", "yellow"],
    strokeWidth: [
      { id: 1, value: 2, icon: <Minus strokeWidth={1} className="size-4" /> },
      { id: 2, value: 4, icon: <Minus strokeWidth={3} className="size-4" /> },
      { id: 3, value: 7, icon: <Minus strokeWidth={5} className="size-4" /> },
    ],
    strokeStyle: [
      {
        id: 1,
        value: "solid" as const,
        icon: <Minus strokeWidth={1} className="size-4" />,
      },
      {
        id: 2,
        value: "dashed" as const,
        icon: (
          <svg
            aria-hidden="true"
            focusable="false"
            role="img"
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            strokeWidth="2"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <g strokeWidth="2">
              <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
              <path d="M5 12h2"></path>
              <path d="M17 12h2"></path>
              <path d="M11 12h2"></path>
            </g>
          </svg>
        ),
      },
      {
        id: 3,
        value: "dotted" as const,
        icon: (
          <svg
            aria-hidden="true"
            focusable="false"
            role="img"
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            strokeWidth="2"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <g strokeWidth="2">
              <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
              <path d="M4 12v.01"></path>
              <path d="M8 12v.01"></path>
              <path d="M12 12v.01"></path>
              <path d="M16 12v.01"></path>
              <path d="M20 12v.01"></path>
            </g>
          </svg>
        ),
      },
    ],
  },
  eraser: {
    strokeWidth: [
      { id: 1, value: 4, icon: <Minus strokeWidth={1} className="size-4" /> },
      { id: 2, value: 8, icon: <Minus strokeWidth={3} className="size-4" /> },
      { id: 3, value: 14, icon: <Minus strokeWidth={5} className="size-4" /> },
    ],
  },
  text: {
    stroke: ["black", "red", "green", "blue", "yellow"],
    strokeWidth: [
      {
        id: 1,
        value: 16,
        icon: <Minus strokeWidth={1} className="size-4" />,
      },
      {
        id: 2,
        value: 24,
        icon: <Minus strokeWidth={3} className="size-4" />,
      },
      {
        id: 3,
        value: 32,
        icon: <Minus strokeWidth={5} className="size-4" />,
      },
    ],
  },
  grab: {},
};

export default function ToolSettingMenu() {
  const tool = useToolStore((state) => state.tool);
  const fontSize = useToolStore((state) => state.fontSize);
  const strokeColor = useToolStore((state) => state.strokeColor);
  const strokeWidth = useToolStore((state) => state.strokeWidth);
  const strokeStyle = useToolStore((state) => state.strokeStyle);
  const setStrokeColor = useToolStore((state) => state.setStrokeColor);
  const setStrokeWidth = useToolStore((state) => state.setStrokeWidth);
  const setStrokeStyle = useToolStore((state) => state.setStrokeStyle);
  const setFontSize = useToolStore((state) => state.setFontSize);

  const config = strokeSettingConfig[tool];

  if (!config || Object.keys(config).length === 0) return null;

  return (
    <div className="text-muted-foreground fixed top-1/2 left-10 z-50 flex -translate-y-1/2 rounded-sm border bg-white p-1 font-mono shadow">
      <div className="flex flex-col gap-1 px-1.5 py-1">
        {"stroke" in config && (
          <div>
            <h4 className="text-[12px]">Stroke</h4>
            <div className="flex gap-1">
              {config.stroke.map((color) => (
                <Button
                  key={color}
                  variant="ghost"
                  onClick={() => setStrokeColor(color)}
                  className={`h-7 cursor-pointer rounded-sm border p-0 hover:bg-transparent ${strokeColor === color ? `ring-2 ring-black` : ""}`}
                >
                  <div
                    className="size-6 rounded-sm"
                    style={{ backgroundColor: color }}
                  />
                </Button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-1">
          <h4 className="text-[8px]">Stroke width</h4>
          <div className="flex w-fit justify-between gap-1">
            {"strokeWidth" in config &&
              config.strokeWidth.map((width) => (
                <Button
                  key={width.id}
                  variant="outline"
                  onClick={() => {
                    if (tool === "text") {
                      setFontSize(width.value);
                    } else {
                      setStrokeWidth(width.value);
                    }
                  }}
                  className={`h-7 cursor-pointer rounded-sm px-1.25 ${(tool === "text" ? fontSize : strokeWidth) === width.value ? "bg-accent" : ""}`}
                >
                  <span className="cursor-pointer text-[10px]">
                    {width.icon}
                  </span>
                </Button>
              ))}
          </div>
        </div>

        {"strokeStyle" in config && (
          <div className="space-y-1">
            <h4 className="text-[8px]">Stroke style</h4>
            <div className="flex gap-1">
              {config.strokeStyle.map((style) => (
                <Button
                  key={style.id}
                  variant="outline"
                  onClick={() => setStrokeStyle(style.value)}
                  className={`h-7 cursor-pointer rounded-sm px-1.25 ${strokeStyle === style.value ? "bg-accent" : ""}`}
                >
                  <span className="cursor-pointer text-sm">{style.icon}</span>
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
