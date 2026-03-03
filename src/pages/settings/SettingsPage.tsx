import { useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/PageHeader";
import { useRestaurant } from "@/hooks/useRestaurant";
import { useUpdateRestaurant } from "@/hooks/useRestaurants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AISettingsTab } from "@/components/settings/AISettingsTab";
import { UserProfileTab } from "@/components/settings/UserProfileTab";
import { HugeiconsIcon } from "@hugeicons/react";
import { Settings01Icon, AiMagicIcon, UserIcon } from "@hugeicons/core-free-icons";

const languages = [
  { code: "en", label: "settings.english", flag: "🇺🇸" },
  { code: "my", label: "settings.burmese", flag: "🇲🇲" },
  { code: "de", label: "settings.german", flag: "🇩🇪" },
];

const aiMenuLanguages = [
  { value: "English", label: "settings.english", flag: "🇺🇸" },
  { value: "Myanmar", label: "settings.burmese", flag: "🇲🇲" },
  { value: "German", label: "settings.german", flag: "🇩🇪" },
];

export const SettingsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t, i18n } = useTranslation();
  const { currentRestaurant, setCurrentRestaurant } = useRestaurant();
  const updateRestaurant = useUpdateRestaurant();
  const tabParam = searchParams.get("tab");
  const activeTab = tabParam === "profile" ? "profile" : tabParam === "ai" && currentRestaurant ? "ai" : "general";

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const changeAiMenuLanguage = (language: string) => {
    if (!currentRestaurant || updateRestaurant.isPending) return;
    updateRestaurant.mutate(
      {
        id: currentRestaurant.id,
        data: {
          name: currentRestaurant.name,
          address: currentRestaurant.address,
          phone: currentRestaurant.phone,
          currency: currentRestaurant.currency,
          booking_window_start_hours: currentRestaurant.booking_window_start_hours,
          booking_window_end_hours: currentRestaurant.booking_window_end_hours,
          tax_percent: currentRestaurant.tax_percent,
          remove_decimal: currentRestaurant.remove_decimal,
          ai_menu_language: language,
        },
      },
      {
        onSuccess: (updated) => {
          setCurrentRestaurant(updated);
        },
      }
    );
  };

  const currentLang = languages.find((l) => l.code === i18n.language);
  const currentAiLang = aiMenuLanguages.find(
    (l) => l.value === currentRestaurant?.ai_menu_language
  );

  return (
    <div className="space-y-6">
      <PageHeader title={t("settings.title")} />

      <Tabs value={activeTab} onValueChange={(tab) => setSearchParams(tab === "general" ? {} : { tab }, { replace: true })}>
        <TabsList className="gap-1">
          <TabsTrigger value="general" className="gap-1.5">
            <HugeiconsIcon icon={Settings01Icon} strokeWidth={2} className="size-3.5" />
            {t("settings.general")}
          </TabsTrigger>
          <TabsTrigger value="profile" className="gap-1.5">
            <HugeiconsIcon icon={UserIcon} strokeWidth={2} className="size-3.5" />
            {t("settings.userProfile")}
          </TabsTrigger>
          {currentRestaurant && (
            <TabsTrigger value="ai" className="gap-1.5">
              <HugeiconsIcon icon={AiMagicIcon} strokeWidth={2} className="size-3.5" />
              {t("settings.aiSettings")}
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="general">
          <div className="grid gap-6 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t("settings.language")}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {t("settings.languageDescription")}
                </p>
              </CardHeader>
              <CardContent>
                <Select value={i18n.language} onValueChange={changeLanguage}>
                  <SelectTrigger>
                    <SelectValue>
                      {currentLang && (
                        <span className="flex items-center gap-2">
                          <span>{currentLang.flag}</span>
                          <span>{t(currentLang.label)}</span>
                        </span>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        <span className="flex items-center gap-2">
                          <span>{lang.flag}</span>
                          <span>{t(lang.label)}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {currentRestaurant && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{t("settings.aiMenuLanguage")}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {t("settings.aiMenuLanguageDescription")}
                  </p>
                </CardHeader>
                <CardContent>
                  <Select
                    value={currentRestaurant.ai_menu_language || "English"}
                    onValueChange={changeAiMenuLanguage}
                    disabled={updateRestaurant.isPending}
                  >
                    <SelectTrigger>
                      <SelectValue>
                        {currentAiLang && (
                          <span className="flex items-center gap-2">
                            <span>{currentAiLang.flag}</span>
                            <span>{t(currentAiLang.label)}</span>
                          </span>
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {aiMenuLanguages.map((lang) => (
                        <SelectItem key={lang.value} value={lang.value}>
                          <span className="flex items-center gap-2">
                            <span>{lang.flag}</span>
                            <span>{t(lang.label)}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="profile">
          <UserProfileTab />
        </TabsContent>

        {currentRestaurant && (
          <TabsContent value="ai">
            <AISettingsTab />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};
