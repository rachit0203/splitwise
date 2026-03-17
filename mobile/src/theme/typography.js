import { colors } from "./colors";

export const fonts = {
  sans: "DMSans",
  mono: "DMSans_Mono",
};

export const textStyles = {
  // Headings
  h1: {
    fontFamily: "DMSans",
    fontSize: 22,
    fontWeight: "600",
    color: colors.white,
  },
  h2: {
    fontFamily: "DMSans",
    fontSize: 20,
    fontWeight: "600",
    color: colors.white,
  },
  h3: {
    fontFamily: "DMSans",
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
  },

  // Body
  body: {
    fontFamily: "DMSans",
    fontSize: 14,
    fontWeight: "400",
    color: colors.textPrimary,
  },
  bodyMd: {
    fontFamily: "DMSans",
    fontSize: 14,
    fontWeight: "500",
    color: colors.textPrimary,
  },
  small: {
    fontFamily: "DMSans",
    fontSize: 12,
    fontWeight: "400",
    color: colors.textSecondary,
  },
  tiny: {
    fontFamily: "DMSans",
    fontSize: 11,
    fontWeight: "500",
    color: colors.textSecondary,
  },

  // Special
  bigAmount: {
    fontFamily: "DMSans",
    fontSize: 52,
    fontWeight: "600",
    color: colors.white,
    letterSpacing: -2,
  },
  cardAmount: {
    fontFamily: "DMSans",
    fontSize: 34,
    fontWeight: "600",
    color: colors.white,
  },
  label: {
    fontFamily: "DMSans",
    fontSize: 11,
    fontWeight: "500",
    color: colors.textSecondary,
    letterSpacing: 0.7,
    textTransform: "uppercase",
  },
  sectionTitle: {
    fontFamily: "DMSans",
    fontSize: 12,
    fontWeight: "500",
    color: colors.textSecondary,
    letterSpacing: 1.0,
    textTransform: "uppercase",
  },
};
