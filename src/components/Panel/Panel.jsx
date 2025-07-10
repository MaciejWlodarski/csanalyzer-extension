import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import PanelContent from "./PanelContent/PanelContent";

const Panel = ({ side, sideOffset }) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="hover: size-10 rounded-xl bg-neutral-800 p-0.5 hover:bg-brand"
        >
          <div className="size-full rounded-[0.625rem] bg-neutral-700 p-1">
            <img
              src={chrome.runtime.getURL("assets/icon.svg")}
              alt="icon"
              className="size-full"
            />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        id="react-root-panel"
        side={side}
        sideOffset={sideOffset}
        className="h-screen w-96 rounded-none border-0 bg-transparent px-0 py-4"
      >
        <PanelContent />
      </PopoverContent>
    </Popover>
  );
};

export default Panel;
