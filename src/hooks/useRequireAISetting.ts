import { useCallback } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { useRestaurant } from "@/hooks/useRestaurant";
import { useAISettings } from "@/hooks/useAISettings";
import { useAlertDialog } from "@/hooks/useAlertDialog";

export const useRequireAISetting = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentRestaurant } = useRestaurant();
  const { data: aiSettings } = useAISettings(currentRestaurant?.id);
  const { confirm } = useAlertDialog();

  const hasActiveAISetting = aiSettings?.some((s) => s.is_active) ?? false;

  const requireAISetting = useCallback(async (): Promise<boolean> => {
    if (hasActiveAISetting) return true;

    const goToSettings = await confirm({
      title: t("settings.aiSettingRequired"),
      description: t("settings.aiSettingRequiredDescription"),
      confirmLabel: t("settings.goToAISettings"),
      cancelLabel: t("common.cancel"),
    });

    if (goToSettings) {
      navigate("/dashboard/settings?tab=ai");
    }

    return false;
  }, [hasActiveAISetting, confirm, t, navigate]);

  return { hasActiveAISetting, requireAISetting };
};
