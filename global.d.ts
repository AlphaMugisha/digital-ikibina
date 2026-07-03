import type en from "./messages/en.json";

declare global {
  // Enables typed `t("namespace.key")` calls across next-intl hooks/functions.
  type IntlMessages = typeof en;
}
