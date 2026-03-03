/**
 * Guest Menu Page
 * Display restaurant menu for guest ordering via QR code
 */

import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCart } from "@/hooks/useCart";
import { useGuestMenuItems, useGuestAISearchMenuItems } from "@/hooks/useMenuItems";
import { useGuestRestaurant } from "@/hooks/useRestaurants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MenuBrowser } from "@/components/order/MenuBrowser";
import type { MenuItem } from "@/types";


export const GuestMenuPage = () => {
  const { t } = useTranslation();
  const { restaurantId: restaurantIdParam, token } = useParams<{
    restaurantId: string;
    token: string;
  }>();
  const { setTableToken, addItem, items } = useCart();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [aiEnabled, setAIEnabled] = useState(true);
  const [aiSearchQuery, setAISearchQuery] = useState("");
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>(null);

  const restaurantId = restaurantIdParam ? Number(restaurantIdParam) : null;

  // Initialize cart with restaurant ID and token
  useEffect(() => {
    if (token && restaurantId) {
      setTableToken(token, restaurantId);
    }
  }, [token, restaurantId, setTableToken]);

  const {
    data: restaurant,
    isLoading: restaurantLoading,
  } = useGuestRestaurant(restaurantId || undefined, token);

  const hasAI = restaurant?.ai_setup ?? false;

  const {
    data: menuItems = [],
    isLoading: menuItemsLoading,
  } = useGuestMenuItems(
    restaurantId || undefined,
    token,
    !(hasAI && aiEnabled) ? (debouncedKeyword || undefined) : undefined
  );

  const {
    data: aiMenuItems = [],
    isFetching: aiSearchLoading,
  } = useGuestAISearchMenuItems(
    restaurantId || undefined,
    token,
    hasAI && aiEnabled ? (aiSearchQuery || undefined) : undefined
  );

  const displayMenuItems = hasAI && aiEnabled && aiSearchQuery ? aiMenuItems : menuItems;

  const handleSearchSubmit = () => {
    if (aiEnabled && searchInput.trim()) {
      setAISearchQuery(searchInput.trim());
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    if (!value) {
      setAISearchQuery("");
      setDebouncedKeyword("");
    }
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedKeyword(value);
    }, 1000);
  };

  const currency = restaurant?.currency || "USD";

  const handleAddToCart = (menuItem: MenuItem) => {
    addItem(menuItem, 1);
  };

  if (!token) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>{t("guest.invalidAccess")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {t("guest.scanQRCode")}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (restaurantLoading || menuItemsLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="pb-24">
      <MenuBrowser
        menuItems={displayMenuItems}
        categories={[]}
        currency={currency}
        onAddItem={handleAddToCart}
        getItemQuantity={(id) => items.find((i) => i.menu_item.id === id)?.quantity ?? 0}
        searchInput={searchInput}
        onSearchChange={handleSearchChange}
        onSearchSubmit={handleSearchSubmit}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        aiEnabled={hasAI && aiEnabled}
        onAIToggle={hasAI ? setAIEnabled : undefined}
        aiSearchLoading={aiSearchLoading}
      />
    </div>
  );
};
