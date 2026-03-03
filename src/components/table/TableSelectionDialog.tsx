import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useRestaurant } from "@/hooks/useRestaurant";
import { useTables } from "@/hooks/useTables";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { HugeiconsIcon } from "@hugeicons/react";
import { SeatSelectorIcon } from "@hugeicons/core-free-icons";
import { TableStatus } from "@/types";

interface TableSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TableSelectionDialog = ({
  open,
  onOpenChange,
}: TableSelectionDialogProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentRestaurant } = useRestaurant();
  const { data: tables = [] } = useTables(currentRestaurant?.id);

  const availableTables = tables.filter(
    (table) => table.is_active && table.status === TableStatus.AVAILABLE
  );
  const otherTables = tables.filter(
    (table) => table.is_active && table.status !== TableStatus.AVAILABLE
  );

  const handleSelect = (tableId: number) => {
    onOpenChange(false);
    navigate(`create?tableId=${tableId}`);
  };

  const handleSkip = () => {
    onOpenChange(false);
    navigate("create");
  };

  const statusColor: Record<string, string> = {
    available: "bg-green-500",
    booked: "bg-amber-500",
    unavailable: "bg-red-500",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{t("order.selectTable")}</DialogTitle>
          <DialogDescription>
            {t("order.selectTableDescription")}
          </DialogDescription>
        </DialogHeader>
        <div className="overflow-y-auto -mx-6 px-6 space-y-4">
          <button
            onClick={handleSkip}
            className="w-full rounded-lg border border-dashed p-3 text-center text-sm text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
          >
            {t("order.noTable")}
          </button>

          {availableTables.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {availableTables.map((table) => (
                <button
                  key={table.id}
                  onClick={() => handleSelect(table.id)}
                  className="flex flex-col items-center gap-1 rounded-lg border border-green-200 bg-green-50 p-3 text-center transition-colors hover:bg-green-100 dark:border-green-900 dark:bg-green-950/30 dark:hover:bg-green-950/50"
                >
                  <span className="text-sm font-semibold">
                    {table.table_number}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <HugeiconsIcon
                      icon={SeatSelectorIcon}
                      strokeWidth={2}
                      className="size-3"
                    />
                    {table.seats}
                  </span>
                </button>
              ))}
            </div>
          )}

          {otherTables.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-xs text-muted-foreground">
                {t("order.otherTables")}
              </p>
              <div className="grid grid-cols-3 gap-2">
                {otherTables.map((table) => (
                  <button
                    key={table.id}
                    onClick={() => handleSelect(table.id)}
                    className="flex flex-col items-center gap-1 rounded-lg border p-3 text-center transition-colors hover:bg-muted/50"
                  >
                    <span className="text-sm font-semibold">
                      {table.table_number}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <span
                        className={`size-2 rounded-full ${statusColor[table.status]}`}
                      />
                      {t(`table.${table.status}`)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {tables.filter((t) => t.is_active).length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {t("table.noTablesYet")}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
