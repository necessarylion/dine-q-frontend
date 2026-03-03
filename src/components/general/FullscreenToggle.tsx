import { useEffect } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { MaximizeScreenIcon, MinimizeScreenIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useUIStore } from "@/stores/uiStore";

export const FullscreenToggle = ({
  enterLabel,
  exitLabel,
}: {
  enterLabel: string;
  exitLabel: string;
}) => {
  const { sidebarHidden, toggleSidebar, setSidebarHidden } = useUIStore();

  // Sync state when user exits fullscreen via Esc key
  useEffect(() => {
    const handler = () => {
      if (!document.fullscreenElement) {
        setSidebarHidden(false);
      }
    };
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, [setSidebarHidden]);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline" size="icon-sm" onClick={toggleSidebar}>
          <HugeiconsIcon
            icon={sidebarHidden ? MinimizeScreenIcon : MaximizeScreenIcon}
            strokeWidth={2}
            className="size-4"
          />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{sidebarHidden ? exitLabel : enterLabel}</TooltipContent>
    </Tooltip>
  );
};
