"use client";

import { createTheme } from "@mui/material/styles";

// Palette and typography from the design system established for this
// project: near-white background, blue as the primary color, dark blue on
// hover, grays for secondary text, green/red/amber for status. Roboto +
// Material Icons. Rounded corners and soft shadows everywhere.
const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#2563EB",
      dark: "#1D4ED8",
      light: "#60A5FA",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#7C3AED",
    },
    success: {
      main: "#16A34A",
    },
    error: {
      main: "#DC2626",
    },
    warning: {
      main: "#D97706",
    },
    background: {
      default: "#FAFAFB",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#111827",
      secondary: "#6B7280",
    },
    divider: "#E5E7EB",
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700, fontSize: "1.9rem" },
    h5: { fontWeight: 600, fontSize: "1.375rem" },
    h6: { fontWeight: 600, fontSize: "1.1rem" },
    button: { fontWeight: 600, textTransform: "none" },
  },
  shape: {
    borderRadius: 14,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: "0 1px 3px rgba(17, 24, 39, 0.08), 0 1px 2px rgba(17,24,39,0.04)",
          border: "1px solid #EEF0F3",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          paddingTop: 8,
          paddingBottom: 8,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: "outlined",
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 18,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: "0 1px 2px rgba(17,24,39,0.06)",
        },
      },
    },
  },
});

export default theme;
