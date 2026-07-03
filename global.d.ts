import type en from "./messages/en.json";

type Messages = typeof en;

declare global {
  // Enables typed `t("namespace.key")` calls across next-intl hooks/functions.
  interface IntlMessages extends Messages {}
}
