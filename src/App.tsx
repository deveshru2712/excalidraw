import Canvas from "@/components/Canvas";
import CursorOverlay from "@/components/CursorOverlay";
import ToolsMenu from "@/components/ToolMenu";
import ToolSettingMenu from "@/components/ToolSettingMenu";
import UtilsMenu from "@/components/UtilsMenu";

function App() {
  return (
    <div className="relative h-screen w-full">
      <ToolsMenu />
      <Canvas />
      <CursorOverlay />
      <ToolSettingMenu />
      <UtilsMenu />
    </div>
  );
}

export default App;
