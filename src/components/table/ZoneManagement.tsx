/**
 * ZoneManagement component
 * Manage floor plan zones via API and assign tables to zones
 * Supports drag-and-drop of tables between zones
 */

import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { useRestaurant } from "@/hooks/useRestaurant";
import { useAlertDialog } from "@/hooks/useAlertDialog";
import {
  useTables,
  useZones,
  useCreateZone,
  useUpdateZone,
  useDeleteZone,
  useUpdateTable,
} from "@/hooks/useTables";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  PencilEdit01Icon,
  Delete01Icon,
  SeatSelectorIcon,
  TableRoundIcon,
  Add01Icon,
  DragDropIcon,
  CellsIcon,
} from "@hugeicons/core-free-icons";
import type { Table, Zone } from "@/types";

// Draggable table item
const DraggableTableItem = ({ table }: { table: Table }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `table-${table.id}`,
      data: { table },
    });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`flex items-center gap-3 rounded-lg border bg-card px-3 py-2 cursor-grab active:cursor-grabbing ${
        isDragging ? "opacity-30" : ""
      }`}
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <HugeiconsIcon
          icon={TableRoundIcon}
          strokeWidth={2}
          className="size-4 text-muted-foreground shrink-0"
        />
        <span className="text-sm font-medium truncate">
          {table.table_number}
        </span>
      </div>
      <div className="flex items-center gap-1 text-muted-foreground shrink-0">
        <HugeiconsIcon
          icon={SeatSelectorIcon}
          strokeWidth={2}
          className="size-3.5"
        />
        <span className="text-xs">{table.seats}</span>
      </div>
      <HugeiconsIcon
        icon={DragDropIcon}
        strokeWidth={2}
        className="size-4 text-muted-foreground shrink-0"
      />
    </div>
  );
};

// Overlay shown while dragging
const TableDragOverlay = ({ table }: { table: Table }) => (
  <div className="flex items-center gap-3 rounded-lg border bg-card px-3 py-2 shadow-lg opacity-90 w-56">
    <div className="flex items-center gap-2 flex-1 min-w-0">
      <HugeiconsIcon
        icon={TableRoundIcon}
        strokeWidth={2}
        className="size-4 text-muted-foreground shrink-0"
      />
      <span className="text-sm font-medium truncate">
        {table.table_number}
      </span>
    </div>
    <div className="flex items-center gap-1 text-muted-foreground shrink-0">
      <HugeiconsIcon
        icon={SeatSelectorIcon}
        strokeWidth={2}
        className="size-3.5"
      />
      <span className="text-xs">{table.seats}</span>
    </div>
  </div>
);

// Droppable zone container
const DroppableZone = ({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) => {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`transition-colors rounded-lg ${
        isOver ? "bg-primary/5 ring-2 ring-primary/30" : ""
      }`}
    >
      {children}
    </div>
  );
};

export const ZoneManagement = () => {
  const { t } = useTranslation();
  const { currentRestaurant } = useRestaurant();
  const { data: tables = [] } = useTables(currentRestaurant?.id);
  const { data: zones = [] } = useZones(currentRestaurant?.id);
  const createZoneMutation = useCreateZone();
  const updateZoneMutation = useUpdateZone();
  const deleteZoneMutation = useDeleteZone();
  const updateTableMutation = useUpdateTable();

  const [newZoneName, setNewZoneName] = useState("");
  const [newZoneColor, setNewZoneColor] = useState("#6366f1");
  const [editingZone, setEditingZone] = useState<Zone | null>(null);
  const [editZoneName, setEditZoneName] = useState("");
  const [editZoneColor, setEditZoneColor] = useState("");
  const [activeTable, setActiveTable] = useState<Table | null>(null);
  const { confirm } = useAlertDialog();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const table = event.active.data.current?.table as Table | undefined;
    if (table) setActiveTable(table);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveTable(null);
    const { active, over } = event;
    if (!over || !currentRestaurant) return;

    const table = active.data.current?.table as Table | undefined;
    if (!table) return;

    const targetZoneId = over.id as string;
    const newZoneId = targetZoneId === "zone-none" ? null : Number(targetZoneId.replace("zone-", ""));

    // Skip if same zone
    if ((table.zone_id ?? null) === newZoneId) return;

    try {
      await updateTableMutation.mutateAsync({
        restaurantId: currentRestaurant.id,
        tableId: table.id,
        table_number: table.table_number,
        is_active: table.is_active,
        seats: table.seats,
        zone_id: newZoneId,
        position_x: table.position_x,
        position_y: table.position_y,
      });
    } catch {
      // error handled by mutation
    }
  };

  const handleAddZone = async () => {
    const name = newZoneName.trim();
    if (!name || !currentRestaurant) return;

    try {
      await createZoneMutation.mutateAsync({
        restaurantId: currentRestaurant.id,
        name,
        color: newZoneColor,
      });
      setNewZoneName("");
    } catch {
      // error handled by mutation
    }
  };

  const startEditZone = (zone: Zone) => {
    setEditingZone(zone);
    setEditZoneName(zone.name);
    setEditZoneColor(zone.color || "#6366f1");
  };

  const handleUpdateZone = async () => {
    if (!editingZone || !currentRestaurant) return;
    const name = editZoneName.trim();
    if (!name) return;

    try {
      await updateZoneMutation.mutateAsync({
        restaurantId: currentRestaurant.id,
        zoneId: editingZone.id,
        name,
        color: editZoneColor,
      });
      setEditingZone(null);
    } catch {
      // error handled by mutation
    }
  };

  const handleDeleteZone = async (zone: Zone) => {
    if (!currentRestaurant) return;

    const confirmed = await confirm({
      title: t("zone.deleteZone"),
      description: t("zone.deleteConfirm", { name: zone.name }),
      confirmLabel: t("common.delete"),
      destructive: true,
    });
    if (!confirmed) return;

    try {
      await deleteZoneMutation.mutateAsync({
        restaurantId: currentRestaurant.id,
        zoneId: zone.id,
      });
    } catch {
      // error handled by mutation
    }
  };

  // Group tables by zone
  const tablesByZone = zones.map((zone) => {
    const zoneTables = tables.filter((table) => table.zone_id === zone.id);
    const totalSeats = zoneTables.reduce((sum, table) => sum + table.seats, 0);
    return { zone, tables: zoneTables, totalSeats };
  });

  // Unassigned tables (no zone_id)
  const unassignedTables = tables.filter((table) => !table.zone_id);

  return (
    <div className="space-y-6">
      {/* Add zone */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <HugeiconsIcon icon={Add01Icon} strokeWidth={2} className="size-4" />
            {t("zone.addNewZone")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              placeholder={t("zone.zonePlaceholder")}
              value={newZoneName}
              onChange={(e) => setNewZoneName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddZone()}
            />
            <Input
              type="color"
              value={newZoneColor}
              onChange={(e) => setNewZoneColor(e.target.value)}
              className="w-12 p-1 h-8!"
            />
            <Button
              onClick={handleAddZone}
              disabled={!newZoneName.trim() || createZoneMutation.isPending}
            >
              {createZoneMutation.isPending ? t("zone.adding") : t("zone.addZone")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Zone list with drag-and-drop */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="space-y-4">
          {tablesByZone.map(({ zone, tables: zoneTables, totalSeats }) => (
            <DroppableZone key={zone.id} id={`zone-${zone.id}`}>
              <Card
                className="overflow-hidden"
                style={{
                  borderLeftWidth: "3px",
                  borderLeftColor: zone.color || undefined,
                }}
              >
                <CardHeader>
                  {editingZone?.id === zone.id ? (
                    <div className="flex items-center gap-3">
                      <Input
                        value={editZoneName}
                        onChange={(e) => setEditZoneName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleUpdateZone()}
                        className="h-8 flex-1"
                      />
                      <Input
                        type="color"
                        value={editZoneColor}
                        onChange={(e) => setEditZoneColor(e.target.value)}
                        className="w-10 p-1 h-8"
                      />
                      <Button
                        size="sm"
                        onClick={handleUpdateZone}
                        disabled={!editZoneName.trim() || updateZoneMutation.isPending}
                      >
                        {updateZoneMutation.isPending ? t("common.saving") : t("common.save")}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingZone(null)}
                      >
                        {t("common.cancel")}
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-base">{zone.name}</CardTitle>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <HugeiconsIcon icon={TableRoundIcon} strokeWidth={2} className="size-3.5" />
                            {zoneTables.length}
                          </span>
                          <span className="flex items-center gap-1">
                            <HugeiconsIcon icon={SeatSelectorIcon} strokeWidth={2} className="size-3.5" />
                            {totalSeats}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          onClick={() => startEditZone(zone)}
                        >
                          <HugeiconsIcon icon={PencilEdit01Icon} strokeWidth={2} className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteZone(zone)}
                          disabled={deleteZoneMutation.isPending}
                        >
                          <HugeiconsIcon icon={Delete01Icon} strokeWidth={2} className="size-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  {zoneTables.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic py-2">
                      {t("zone.noTablesAssigned")}
                    </p>
                  ) : (
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {zoneTables.map((table) => (
                        <DraggableTableItem key={table.id} table={table} />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </DroppableZone>
          ))}

          {/* Unassigned tables */}
          {unassignedTables.length > 0 && (
            <DroppableZone id="zone-none">
              <Card className="border-dashed">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base text-muted-foreground flex items-center gap-2">
                      <HugeiconsIcon icon={CellsIcon} strokeWidth={2} className="size-4" />
                      {t("zone.unassignedTables")}
                    </CardTitle>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <HugeiconsIcon icon={DragDropIcon} strokeWidth={2} className="size-3.5" />
                      {t("zone.dragToZone")}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {unassignedTables.map((table) => (
                      <DraggableTableItem key={table.id} table={table} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </DroppableZone>
          )}
        </div>

        <DragOverlay>
          {activeTable && <TableDragOverlay table={activeTable} />}
        </DragOverlay>
      </DndContext>
    </div>
  );
};
