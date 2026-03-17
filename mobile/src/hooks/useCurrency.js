import { useMemo } from "react";

export function useCurrency() {
  return useMemo(() => {
    const parts = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).formatToParts(0);
    const currency = parts.find((part) => part.type === "currency");
    return currency?.value || "";
  }, []);
}
