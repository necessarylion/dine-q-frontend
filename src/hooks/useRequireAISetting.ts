import { useCallback } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { useRestaurant } from "@/hooks/useRestaurant";
import { useAlertDialog } from "@/hooks/useAlertDialog";

export const useRequireAISetting = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentRestaurant } = useRestaurant();
  const { confirm } = useAlertDialog();

  const hasAISetup = currentRestaurant?.ai_setup ?? false;

  const requireAISetting = useCallback(async (): Promise<boolean> => {
    if (hasAISetup) return true;

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
  }, [hasAISetup, confirm, t, navigate]);

  return { hasAISetup, requireAISetting };
};
