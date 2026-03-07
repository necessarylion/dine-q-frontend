import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Loading03Icon, Tick01Icon } from "@hugeicons/core-free-icons";
import { useImageSearch } from "@/hooks/useMenuItems";
import { cn } from "@/lib/utils";

interface ImageSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  restaurantId: number;
  query: string;
  onSelect: (files: File[]) => void;
}

export const ImageSearchDialog = ({
  open,
  onOpenChange,
  restaurantId,
  query,
  onSelect,
}: ImageSearchDialogProps) => {
  const { t } = useTranslation();
  const { data, isLoading, isFetching, refetch } = useImageSearch(
    restaurantId,
    open ? query : ""
  );
  const images = data?.images;
  const showLoading = isLoading || isFetching;
  const [selectedUrls, setSelectedUrls] = useState<Set<string>>(new Set());
  const [brokenUrls, setBrokenUrls] = useState<Set<string>>(new Set());
  const [isConverting, setIsConverting] = useState(false);

  useEffect(() => {
    if (open) {
      setSelectedUrls(new Set());
      setBrokenUrls(new Set());
      refetch();
    }
  }, [open, refetch]);

  const toggleSelect = (url: string) => {
    setSelectedUrls((prev) => {
      const next = new Set(prev);
      if (next.has(url)) {
        next.delete(url);
      } else {
        next.add(url);
      }
      return next;
    });
  };

  const handleConfirm = async () => {
    if (selectedUrls.size === 0) return;
    setIsConverting(true);
    try {
      const files = await Promise.all(
        Array.from(selectedUrls).map(async (url, i) => {
          const res = await fetch(url);
          const blob = await res.blob();
          const ext = blob.type.split("/")[1] || "jpg";
          return new File([blob], `search-image-${i}.${ext}`, {
            type: blob.type,
          });
        })
      );
      onSelect(files);
      setSelectedUrls(new Set());
      onOpenChange(false);
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{t("menu.imageSearchTitle")}</DialogTitle>
          <DialogDescription>
            {t("menu.imageSearchDescription", { query })}
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 min-h-0">
          {showLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <HugeiconsIcon
                icon={Loading03Icon}
                strokeWidth={2}
                className="size-8 animate-spin text-muted-foreground"
              />
              <p className="text-sm text-muted-foreground">{t("menu.imageSearchLoading")}</p>
            </div>
          ) : !images?.length ? (
            <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
              {t("menu.imageSearchNoResults")}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {images.filter((url) => !brokenUrls.has(url)).map((url) => {
                const isSelected = selectedUrls.has(url);
                return (
                  <button
                    key={url}
                    type="button"
                    className={cn(
                      "relative rounded-lg overflow-hidden border-2 transition-colors cursor-pointer",
                      isSelected
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-transparent hover:border-muted-foreground/30"
                    )}
                    onClick={() => toggleSelect(url)}
                  >
                    <img
                      src={url}
                      alt=""
                      className="h-24 w-full object-cover"
                      onError={() => setBrokenUrls((prev) => new Set(prev).add(url))}
                    />
                    {isSelected && (
                      <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-0.5">
                        <HugeiconsIcon
                          icon={Tick01Icon}
                          strokeWidth={2}
                          className="size-3"
                        />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {images && images.length > 0 && (
          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button
              size="sm"
              disabled={selectedUrls.size === 0 || isConverting}
              onClick={handleConfirm}
            >
              {isConverting
                ? t("menu.imageSearchAdding")
                : t("menu.imageSearchAdd", { count: selectedUrls.size })}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
