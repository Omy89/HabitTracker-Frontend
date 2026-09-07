"use client";

import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import TrackChangesRoundedIcon from "@mui/icons-material/TrackChangesRounded";

/**
 * A decorative, non-interactive preview of the app shell (sidebar, stat
 * tiles, a chart, a list) rendered heavily blurred behind the auth card.
 * It's just shapes in the theme's colors, not real content or components,
 * so there's nothing legible to leak even before the blur is applied.
 */
function BackgroundMockup() {
  return (
    <Box
      aria-hidden
      sx={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        filter: "blur(22px)",
        opacity: 0.5,
        pointerEvents: "none",
        userSelect: "none",
      }}
    >
      <Box sx={{ display: "flex", height: "100%" }}>
        <Box
          sx={{
            width: 220,
            display: { xs: "none", md: "block" },
            bgcolor: "background.paper",
            borderRight: "1px solid",
            borderColor: "divider",
            p: 2,
          }}
        >
          <Box sx={{ width: 32, height: 32, borderRadius: 2, bgcolor: "primary.main", mb: 3 }} />
          {Array.from({ length: 4 }).map((_, i) => (
            <Box
              key={i}
              sx={{
                height: 14,
                borderRadius: 1,
                mb: 2,
                width: i === 0 ? "70%" : "55%",
                bgcolor: i === 0 ? "primary.light" : "divider",
              }}
            />
          ))}
        </Box>
        <Box sx={{ flex: 1, p: 4 }}>
          <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
            {["primary.main", "secondary.main", "warning.main", "success.main"].map((color) => (
              <Box
                key={color}
                sx={{
                  flex: 1,
                  height: 64,
                  borderRadius: 3,
                  bgcolor: "background.paper",
                  border: "1px solid",
                  borderColor: "divider",
                  p: 1.5,
                }}
              >
                <Box sx={{ width: 28, height: 28, borderRadius: 2, bgcolor: color }} />
              </Box>
            ))}
          </Box>
          <Box
            sx={{
              height: 160,
              borderRadius: 3,
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
              display: "flex",
              alignItems: "flex-end",
              gap: 1.5,
              p: 2,
              mb: 3,
            }}
          >
            {[40, 70, 50, 90, 65, 100, 55].map((h, i) => (
              <Box
                key={i}
                sx={{ flex: 1, height: `${h}%`, borderRadius: 1, bgcolor: "primary.light" }}
              />
            ))}
          </Box>
          <Box
            sx={{
              borderRadius: 3,
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
              p: 2,
            }}
          >
            {Array.from({ length: 3 }).map((_, i) => (
              <Box
                key={i}
                sx={{
                  height: 36,
                  borderRadius: 2,
                  bgcolor: "divider",
                  mb: i < 2 ? 1.5 : 0,
                }}
              />
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export default function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <Box
      sx={{
        position: "relative",
        minHeight: "100vh",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
        py: 6,
        background: "radial-gradient(1200px 600px at 10% -10%, #EFF6FF 0%, #FAFAFB 55%)",
      }}
    >
      <BackgroundMockup />
      <Box sx={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 420 }}>
        <Stack alignItems="center" spacing={1} sx={{ mb: 3 }}>
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: 3,
              bgcolor: "primary.main",
              color: "primary.contrastText",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 20px rgba(37,99,235,0.35)",
            }}
          >
            <TrackChangesRoundedIcon fontSize="medium" />
          </Box>
          <Typography variant="h5" fontWeight={700}>
            Habit Tracker
          </Typography>
        </Stack>
        <Card elevation={0}>
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <Typography variant="h5" fontWeight={700} gutterBottom>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {subtitle}
              </Typography>
            )}
            {children}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
