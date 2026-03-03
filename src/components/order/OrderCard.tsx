/**
 * Order Card Component
 * Draggable order card for kanban board
 */

import { forwardRef } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ViewIcon,
  Calendar03Icon,
  TableRoundIcon,
  Restaurant01Icon,
  ShoppingBag02Icon,
  CheckmarkCircle02Icon,
  Loading03Icon,
  DeliveryBox01Icon,
  TaskDone02Icon,
} from "@hugeicons/core-free-icons";
import { Badge } from "@/components/ui/badge";
import { OrderType, OrderStatus, type Order } from "@/types";
import { formatPrice, getNextStatus } from "@/lib/utils";

const nextStatusConfig: Record<string, { icon: any; className: string }> = {
  [OrderStatus.CONFIRMED]: {
    icon: CheckmarkCircle02Icon,
    className: "bg-green-600 text-white hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600",
  },
  [OrderStatus.PREPARING]: {
    icon: Loading03Icon,
    className: "bg-purple-600 text-white hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600",
  },
  [OrderStatus.READY]: {
    icon: DeliveryBox01Icon,
    className: "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600",
  },
  [OrderStatus.COMPLETED]: {
    icon: TaskDone02Icon,
    className: "bg-green-600 text-white hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600",
  },
};

interface OrderCardProps {
  order: Order;
  onViewDetails?: (order: Order) => void;
  onStatusChange?: (order: Order, nextStatus: OrderStatus) => void;
  isDragging?: boolean;
  style?: React.CSSProperties;
  showPrice?: boolean;
  currency?: string;
}

export const OrderCard = forwardRef<HTMLDivElement, OrderCardProps & React.HTMLAttributes<HTMLDivElement>>(
  ({ order, onViewDetails, onStatusChange, isDragging, style, className, showPrice, currency, ...props }, ref) => {
    const { t } = useTranslation();
    const nextStatus = getNextStatus(order.status);
    const formatDateTime = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    return (
      <Card
        ref={ref}
        style={style}
        className={`flex flex-col transition-shadow cursor-grab active:cursor-grabbing ${
          isDragging ? "opacity-50 shadow-lg" : "hover:shadow-md"
        } ${className || ""}`}
        {...props}
      >
        <CardHeader>
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-sm">{t("order.orderNumber", { id: order.id })}</h3>
            <OrderStatusBadge status={order.status} />
          </div>
          <Badge variant="outline" className="w-fit">
            <HugeiconsIcon
              icon={order.order_type === OrderType.DINE_IN ? Restaurant01Icon : ShoppingBag02Icon}
              strokeWidth={2}
              className="size-3.5"
            />
            {order.order_type === OrderType.DINE_IN ? t("order.dineIn") : t("order.takeaway")}
          </Badge>
          <div className="space-y-1 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={Calendar03Icon} strokeWidth={2} className="size-3.5 shrink-0" />
              <span className="text-xs">{formatDateTime(order.created_at)}</span>
            </div>
            {order.table && (
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={TableRoundIcon} strokeWidth={2} className="size-3.5 shrink-0" />
                <span className="text-xs">{order.table.table_number}</span>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="mt-auto space-y-2">
          {/* Order Items */}
          <div className="space-y-1.5">
            {order.order_items && order.order_items.length > 0 ? (
              <>
                {order.order_items.map((item) => (
                  <div
                    key={item.id}
                    className="pb-1.5 border-b last:border-0 last:pb-0"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-medium">
                        {item.quantity}x {item?.name || "Item"}
                      </p>
                      {showPrice && (
                        <p className="text-xs font-medium text-yellow-500 shrink-0">
                          {formatPrice(item.price * item.quantity, currency || "USD")}
                        </p>
                      )}
                    </div>
                    {item.notes && (
                      <p className="text-xs text-amber-600 dark:text-amber-400 italic">
                        {item.notes}
                      </p>
                    )}
                  </div>
                ))}
              </>
            ) : (
              <p className="text-xs text-muted-foreground">{t("order.noItems")}</p>
            )}
          </div>

          {/* Order Total */}
          {showPrice && (
            <div className="flex justify-between border-t pt-2">
              <span className="text-xs font-semibold">{t("payment.total")}</span>
              <span className="text-sm font-bold text-yellow-500">
                {formatPrice(order.total, currency || "USD")}
              </span>
            </div>
          )}

          {/* Actions */}
          {(onViewDetails || (onStatusChange && nextStatus)) && (
            <div className="flex gap-2">
              {onViewDetails && (
                <Button
                  variant="outline"
                  size="xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewDetails(order);
                  }}
                  className="px-1.5 shrink-0"
                >
                  <HugeiconsIcon
                    icon={ViewIcon}
                    strokeWidth={2}
                    className="size-3"
                  />
                </Button>
              )}
              {onStatusChange && nextStatus && (() => {
                const config = nextStatusConfig[nextStatus];
                return (
                  <Button
                    size="xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      onStatusChange(order, nextStatus);
                    }}
                    className={`flex-1 px-1.5 ${config?.className || ""}`}
                  >
                    {config && (
                      <HugeiconsIcon
                        icon={config.icon}
                        strokeWidth={2}
                        className="size-3 mr-1"
                      />
                    )}
                    {t(`order.${nextStatus}`)}
                  </Button>
                );
              })()}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }
);

OrderCard.displayName = "OrderCard";
