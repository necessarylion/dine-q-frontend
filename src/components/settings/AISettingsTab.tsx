import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRestaurant } from "@/hooks/useRestaurant";
import { AI_PROVIDERS } from "@/constants";
import {
  useAISettings,
  useCreateAISetting,
  useUpdateAISetting,
  useDeleteAISetting,
} from "@/hooks/useAISettings";
import { useAlertDialog } from "@/hooks/useAlertDialog";
import {
  createAISettingFormSchema,
  updateAISettingFormSchema,
  type CreateAISettingFormData,
  type UpdateAISettingFormData,
} from "@/schemas/ai_settings_schema";
import type { AISetting } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Field,
  FieldLabel,
  FieldContent,
  FieldError,
} from "@/components/ui/field";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  Edit02Icon,
  Delete02Icon,
  Loading03Icon,
  AiMagicIcon,
} from "@hugeicons/core-free-icons";

export const AISettingsTab = () => {
  const { t } = useTranslation();
  const { currentRestaurant } = useRestaurant();
  const { confirm } = useAlertDialog();

  const { data: aiSettings, isLoading } = useAISettings(currentRestaurant?.id);
  const createMutation = useCreateAISetting();
  const updateMutation = useUpdateAISetting();
  const deleteMutation = useDeleteAISetting();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingSetting, setEditingSetting] = useState<AISetting | null>(null);

  const handleDelete = async (setting: AISetting) => {
    if (!currentRestaurant) return;
    const confirmed = await confirm({
      title: t("settings.deleteAISetting"),
      description: t("settings.deleteAISettingConfirm", { name: setting.name }),
      confirmLabel: t("common.delete"),
      destructive: true,
    });
    if (!confirmed) return;

    try {
      await deleteMutation.mutateAsync({
        restaurantId: currentRestaurant.id,
        aiSettingId: setting.id,
      });
    } catch (error: any) {
      alert(error.message || t("settings.failedToDeleteAISetting"));
    }
  };

  if (!currentRestaurant) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {t("settings.aiSettingsDescription")}
        </p>
        <Button size="sm" className="gap-2" onClick={() => setShowCreateDialog(true)}>
          <HugeiconsIcon icon={Add01Icon} strokeWidth={2} className="size-4" />
          {t("common.add")}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <HugeiconsIcon icon={Loading03Icon} strokeWidth={2} className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : aiSettings && aiSettings.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {aiSettings.map((setting) => (
            <Card key={setting.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    {(() => {
                      const provider = AI_PROVIDERS.find((p) => p.baseUrl && p.baseUrl === setting.base_url);
                      return provider?.icon ? (
                        <img src={provider.icon} alt="" className="size-4" />
                      ) : (
                        <HugeiconsIcon icon={AiMagicIcon} strokeWidth={2} className="size-4" />
                      );
                    })()}
                    {setting.name}
                  </CardTitle>
                  <Switch
                    checked={setting.is_active}
                    onCheckedChange={(checked) => {
                      if (!currentRestaurant) return;
                      updateMutation.mutate({
                        restaurantId: currentRestaurant.id,
                        aiSettingId: setting.id,
                        data: {
                          name: setting.name,
                          base_url: setting.base_url,
                          model: setting.model,
                          vision_model: setting.vision_model,
                          is_active: !!checked,
                        },
                      });
                    }}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("settings.model")}</span>
                    <span className="font-mono">{setting.model}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("settings.visionModel")}</span>
                    <span className="font-mono">{setting.vision_model}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("settings.baseUrl")}</span>
                    <span className="font-mono truncate max-w-[180px]" title={setting.base_url}>
                      {setting.base_url}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("settings.apiKey")}</span>
                    <span className="font-mono">{setting.api_key_hint}</span>
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-1"
                    onClick={() => setEditingSetting(setting)}
                  >
                    <HugeiconsIcon icon={Edit02Icon} strokeWidth={2} className="size-3.5" />
                    {t("common.edit")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-1 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(setting)}
                  >
                    <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} className="size-3.5" />
                    {t("common.delete")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center py-6">
              {t("settings.noAISettings")}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Create Dialog */}
      <CreateAISettingDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        restaurantId={currentRestaurant.id}
        mutation={createMutation}
      />

      {/* Edit Dialog */}
      {editingSetting && (
        <EditAISettingDialog
          open={!!editingSetting}
          onOpenChange={(open) => !open && setEditingSetting(null)}
          restaurantId={currentRestaurant.id}
          setting={editingSetting}
          mutation={updateMutation}
        />
      )}
    </div>
  );
};

function CreateAISettingDialog({
  open,
  onOpenChange,
  restaurantId,
  mutation,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  restaurantId: number;
  mutation: ReturnType<typeof useCreateAISetting>;
}) {
  const { t } = useTranslation();

  const [selectedProvider, setSelectedProvider] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<CreateAISettingFormData>({
    resolver: zodResolver(createAISettingFormSchema) as any,
    defaultValues: {
      name: "",
      base_url: "",
      model: "",
      vision_model: "",
      api_key: "",
      is_active: false,
    },
  });

  const handleProviderChange = (providerId: string) => {
    setSelectedProvider(providerId);
    const provider = AI_PROVIDERS.find((p) => p.id === providerId);
    if (provider) {
      setValue("name", provider.id === "custom" ? "" : provider.name);
      setValue("base_url", provider.baseUrl);
    }
  };

  const onSubmit = async (data: CreateAISettingFormData) => {
    try {
      await mutation.mutateAsync({ restaurantId, data });
      reset();
      setSelectedProvider("");
      onOpenChange(false);
    } catch (error: any) {
      alert(error.message || t("settings.failedToCreateAISetting"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("settings.addAISetting")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel>{t("settings.provider")}</FieldLabel>
              <FieldContent>
                <Select value={selectedProvider} onValueChange={handleProviderChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("settings.selectProvider")} />
                  </SelectTrigger>
                  <SelectContent>
                    {AI_PROVIDERS.map((provider) => (
                      <SelectItem key={provider.id} value={provider.id}>
                        <span className="flex items-center gap-2">
                          {provider.icon ? (
                            <img src={provider.icon} alt="" className="size-4" />
                          ) : (
                            <HugeiconsIcon icon={AiMagicIcon} strokeWidth={2} className="size-4" />
                          )}
                          <span>{provider.id === "custom" ? t("settings.customProvider") : provider.name}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldContent>
            </Field>

            <Field data-invalid={!!errors.name}>
              <FieldLabel>{t("settings.providerName")}</FieldLabel>
              <FieldContent>
                <Input {...register("name")} placeholder="e.g. Gemini Production" />
              </FieldContent>
              {errors.name && <FieldError>{errors.name.message}</FieldError>}
            </Field>
          </div>

          <Field data-invalid={!!errors.base_url}>
            <FieldLabel>{t("settings.baseUrl")}</FieldLabel>
            <FieldContent>
              <Input {...register("base_url")} placeholder="https://..." />
            </FieldContent>
            {errors.base_url && <FieldError>{errors.base_url.message}</FieldError>}
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field data-invalid={!!errors.model}>
              <FieldLabel>{t("settings.model")}</FieldLabel>
              <FieldContent>
                <Input {...register("model")} placeholder="e.g. gemini-3-flash-preview" />
              </FieldContent>
              {errors.model && <FieldError>{errors.model.message}</FieldError>}
            </Field>

            <Field data-invalid={!!errors.vision_model}>
              <FieldLabel>{t("settings.visionModel")}</FieldLabel>
              <FieldContent>
                <Input {...register("vision_model")} placeholder="e.g. gemini-3-flash-preview" />
              </FieldContent>
              {errors.vision_model && <FieldError>{errors.vision_model.message}</FieldError>}
            </Field>
          </div>

          <Field data-invalid={!!errors.api_key}>
            <FieldLabel>{t("settings.apiKey")}</FieldLabel>
            <FieldContent>
              <Input {...register("api_key")} type="password" placeholder="API key" />
            </FieldContent>
            {errors.api_key && <FieldError>{errors.api_key.message}</FieldError>}
          </Field>

          <DialogFooter>
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" size="sm" disabled={mutation.isPending}>
              {mutation.isPending ? t("common.saving") : t("common.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditAISettingDialog({
  open,
  onOpenChange,
  restaurantId,
  setting,
  mutation,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  restaurantId: number;
  setting: AISetting;
  mutation: ReturnType<typeof useUpdateAISetting>;
}) {
  const { t } = useTranslation();

  const matchedProvider = AI_PROVIDERS.find((p) => p.baseUrl && p.baseUrl === setting.base_url);
  const [selectedProvider, setSelectedProvider] = useState<string>(
    matchedProvider?.id || "custom"
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<UpdateAISettingFormData>({
    resolver: zodResolver(updateAISettingFormSchema) as any,
    defaultValues: {
      name: setting.name,
      base_url: setting.base_url,
      model: setting.model,
      vision_model: setting.vision_model,
      api_key: "",
      is_active: setting.is_active,
    },
  });

  const handleProviderChange = (providerId: string) => {
    setSelectedProvider(providerId);
    const provider = AI_PROVIDERS.find((p) => p.id === providerId);
    if (provider) {
      setValue("name", provider.id === "custom" ? "" : provider.name);
      setValue("base_url", provider.baseUrl);
    }
  };

  const onSubmit = async (formData: UpdateAISettingFormData) => {
    const data = { ...formData };
    if (!data.api_key) {
      delete data.api_key;
    }
    try {
      await mutation.mutateAsync({
        restaurantId,
        aiSettingId: setting.id,
        data,
      });
      onOpenChange(false);
    } catch (error: any) {
      alert(error.message || t("settings.failedToUpdateAISetting"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("settings.editAISetting")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel>{t("settings.provider")}</FieldLabel>
              <FieldContent>
                <Select value={selectedProvider} onValueChange={handleProviderChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("settings.selectProvider")} />
                  </SelectTrigger>
                  <SelectContent>
                    {AI_PROVIDERS.map((provider) => (
                      <SelectItem key={provider.id} value={provider.id}>
                        <span className="flex items-center gap-2">
                          {provider.icon ? (
                            <img src={provider.icon} alt="" className="size-4" />
                          ) : (
                            <HugeiconsIcon icon={AiMagicIcon} strokeWidth={2} className="size-4" />
                          )}
                          <span>{provider.id === "custom" ? t("settings.customProvider") : provider.name}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldContent>
            </Field>

            <Field data-invalid={!!errors.name}>
              <FieldLabel>{t("settings.providerName")}</FieldLabel>
              <FieldContent>
                <Input {...register("name")} placeholder="e.g. Gemini Production" />
              </FieldContent>
              {errors.name && <FieldError>{errors.name.message}</FieldError>}
            </Field>
          </div>

          <Field data-invalid={!!errors.base_url}>
            <FieldLabel>{t("settings.baseUrl")}</FieldLabel>
            <FieldContent>
              <Input {...register("base_url")} placeholder="https://..." />
            </FieldContent>
            {errors.base_url && <FieldError>{errors.base_url.message}</FieldError>}
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field data-invalid={!!errors.model}>
              <FieldLabel>{t("settings.model")}</FieldLabel>
              <FieldContent>
                <Input {...register("model")} placeholder="e.g. gemini-3-flash-preview" />
              </FieldContent>
              {errors.model && <FieldError>{errors.model.message}</FieldError>}
            </Field>

            <Field data-invalid={!!errors.vision_model}>
              <FieldLabel>{t("settings.visionModel")}</FieldLabel>
              <FieldContent>
                <Input {...register("vision_model")} placeholder="e.g. gemini-3-flash-preview" />
              </FieldContent>
              {errors.vision_model && <FieldError>{errors.vision_model.message}</FieldError>}
            </Field>
          </div>

          <Field data-invalid={!!errors.api_key}>
            <FieldLabel>{t("settings.apiKey")}</FieldLabel>
            <FieldContent>
              <Input
                {...register("api_key")}
                type="password"
                placeholder={setting.api_key_hint || t("settings.leaveBlankToKeep")}
              />
            </FieldContent>
            {errors.api_key && <FieldError>{errors.api_key.message}</FieldError>}
          </Field>

          <DialogFooter>
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" size="sm" disabled={mutation.isPending}>
              {mutation.isPending ? t("common.saving") : t("common.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
