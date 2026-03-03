import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon } from "@hugeicons/core-free-icons";

export const ModelCombobox = ({
  models,
  value,
  onValueChange,
  placeholder,
}: {
  models: string[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
}) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen} modal>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
          size="sm"
        >
          <span className="truncate">
            {value || <span className="text-muted-foreground">{placeholder}</span>}
          </span>
          <HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={2} className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder={t("common.search") + "..."} />
          <CommandList>
            <CommandEmpty>{t("common.noResults")}</CommandEmpty>
            {models.map((model) => (
              <CommandItem
                key={model}
                value={model}
                data-checked={value === model}
                onSelect={(v) => {
                  onValueChange(v);
                  setOpen(false);
                }}
              >
                {model}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
