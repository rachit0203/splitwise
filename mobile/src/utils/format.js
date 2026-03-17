import { colors } from "../theme";

export function formatINR(amount, decimals = 0) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: decimals,
  }).format(Math.abs(amount));
}

export function formatBalance(amount) {
  if (amount === 0) {
    return { text: "Settled up", color: colors.textSecondary };
  }
  const sign = amount > 0 ? "+" : "−";
  return {
    text: `${sign}${formatINR(amount)}`,
    color: amount > 0 ? colors.success : colors.danger,
  };
}
