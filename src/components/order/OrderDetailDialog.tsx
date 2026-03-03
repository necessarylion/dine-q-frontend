/**
 * Order Detail Dialog Component
 * Shared dialog for viewing order details and updating status
 */

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useRestaurant } from "@/hooks/useRestaurant";
import { useUpdateOrder, useRemoveOrderItem } from "@/hooks/useOrders";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Restaurant01Icon,
  ShoppingBag02Icon,
  Delete01Icon,
} from "@hugeicons/core-free-icons";
import { OrderStatus, OrderType, type Order, type OrderItem } from "@/types";
import { formatPrice } from "@/lib/utils";
import { useAlertDialog } from "@/hooks/useAlertDialog";

interface OrderDetailDialogProps {
  order: Order | null;
  onClose: () => void;
  onStatusUpdated?: () => void;
}

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

export const OrderDetailDialog = ({
  order,
  onClose,
  onStatusUpdated,
}: OrderDetailDialogProps) => {
  const { t } = useTranslation();
  const { currentRestaurant } = useRestaurant();
  const updateOrderMutation = useUpdateOrder();
  const removeItemMutation = useRemoveOrderItem();
  const { confirm } = useAlertDialog();
  const [newStatus, setNewStatus] = useState<OrderStatus | null>(null);
  const [localItems, setLocalItems] = useState<OrderItem[]>([]);
  const currency = currentRestaurant?.currency || "USD";

  useEffect(() => {
    if (order) {
      setNewStatus(order.status);
      setLocalItems(order.order_items ?? []);
    }
  }, [order]);

  const localTotal = localItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const handleRemoveItem = async (item: OrderItem) => {
    if (!currentRestaurant || !order) return;

    if (item.quantity <= 1) {
      const confirmed = await confirm({
        title: t("order.removeItem"),
        description: t("order.removeItemConfirm", { name: item.name }),
        confirmLabel: t("common.delete"),
        destructive: true,
      });
      if (!confirmed) return;
    }

    // Optimistically update local state
    if (item.quantity <= 1) {
      setLocalItems((prev) => prev.filter((i) => i.id !== item.id));
    } else {
      setLocalItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity - 1 } : i))
      );
    }

    try {
      await removeItemMutation.mutateAsync({
        restaurantId: currentRestaurant.id,
        orderId: order.id,
        orderItemId: item.id,
      });
    } catch {
      // Revert on error
      setLocalItems(order.order_items ?? []);
    }
  };

  const handleUpdateStatus = async () => {
    if (!currentRestaurant || !order || !newStatus) return;
    try {
      await updateOrderMutation.mutateAsync({
        restaurantId: currentRestaurant.id,
        orderId: order.id,
        order_type: order.order_type,
        status: newStatus,
        table_id: order.table_id || undefined,
        items:
          order.order_items?.map((item) => ({
            menu_item_id: item.menu_item_id,
            quantity: item.quantity,
            notes: item.notes || undefined,
          })) || [],
      });
      onClose();
      onStatusUpdated?.();
    } catch {
      // error handled by mutation
    }
  };

  return (
    <Dialog open={!!order} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        {order && (
          <>
            <DialogHeader>
              <DialogTitle>{t("order.orderNumber", { id: order.id })}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">{t("order.created")}</p>
                  <p className="font-medium">
                    {formatDateTime(order.created_at)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t("booking.table")}</p>
                  <p className="font-medium">
                    {order.table?.table_number || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t("order.type")}</p>
                  <Badge variant="outline" className="mt-1">
                    <HugeiconsIcon
                      icon={order.order_type === OrderType.DINE_IN ? Restaurant01Icon : ShoppingBag02Icon}
                      strokeWidth={2}
                      className="size-3.5"
                    />
                    {order.order_type === OrderType.DINE_IN ? t("order.dineIn") : t("order.takeaway")}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">{t("booking.status")}</p>
                  <OrderStatusBadge status={order.status} />
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-semibold mb-2">{t("order.items")}</h3>
                <div className="space-y-2 border rounded-lg p-3">
                  {localItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-2 text-sm pb-2 border-b last:border-0 last:pb-0"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">
                          {item.quantity}x {item.name || "Item"}
                        </p>
                        {item.notes && (
                          <p className="text-xs text-muted-foreground">
                            {t("order.note", { note: item.notes })}
                          </p>
                        )}
                      </div>
                      <p className="font-medium shrink-0">
                        {formatPrice(item.price * item.quantity, currency)}
                      </p>
                      {(order.status === OrderStatus.PENDING || order.status === OrderStatus.CONFIRMED) && !order.payment_id && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 shrink-0 text-destructive hover:text-destructive"
                          onClick={() => handleRemoveItem(item)}
                          disabled={removeItemMutation.isPending}
                        >
                          <HugeiconsIcon icon={Delete01Icon} strokeWidth={2} className="size-3.5" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>{t("common.total")}</span>
                <span>{formatPrice(localTotal, currency)}</span>
              </div>

              {/* Update Status */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {t("order.updateStatus")}
                </label>
                <Select
                  value={newStatus || order.status}
                  onValueChange={(value) => setNewStatus(value as OrderStatus)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={OrderStatus.PENDING}>{t("order.pending")}</SelectItem>
                    <SelectItem value={OrderStatus.CONFIRMED}>{t("order.confirmed")}</SelectItem>
                    <SelectItem value={OrderStatus.PREPARING}>{t("order.preparing")}</SelectItem>
                    <SelectItem value={OrderStatus.READY}>{t("order.ready")}</SelectItem>
                    <SelectItem value={OrderStatus.COMPLETED}>{t("order.completed")}</SelectItem>
                    <SelectItem value={OrderStatus.CANCELLED}>{t("order.cancelled")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={onClose}>
                {t("common.close")}
              </Button>
              <Button
                onClick={handleUpdateStatus}
                disabled={
                  updateOrderMutation.isPending ||
                  newStatus === order.status
                }
              >
                {updateOrderMutation.isPending ? t("order.updatingStatus") : t("order.updateStatus")}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
