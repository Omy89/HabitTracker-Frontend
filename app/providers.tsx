"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import EmotionRegistry from "@/lib/EmotionRegistry";
import theme from "@/lib/theme";
import { AuthProvider } from "@/context/AuthContext";
import { HabitsProvider } from "@/context/HabitsContext";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <EmotionRegistry>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <HabitsProvider>{children}</HabitsProvider>
        </AuthProvider>
      </ThemeProvider>
    </EmotionRegistry>
  );
}
