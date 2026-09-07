"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import SpaceDashboardRoundedIcon from "@mui/icons-material/SpaceDashboardRounded";
import ChecklistRoundedIcon from "@mui/icons-material/ChecklistRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import TrackChangesRoundedIcon from "@mui/icons-material/TrackChangesRounded";
import type SvgIcon from "@mui/material/SvgIcon";

export const SIDEBAR_WIDTH = 248;

// Statistics is planned for a later milestone (see .entrega3-backup) and is
// intentionally left out of navigation for now.
const NAV_ITEMS: { href: string; label: string; icon: typeof SvgIcon }[] = [
  { href: "/dashboard", label: "Dashboard", icon: SpaceDashboardRoundedIcon },
  { href: "/habits", label: "Habits", icon: ChecklistRoundedIcon },
  { href: "/profile", label: "Profile", icon: PersonRoundedIcon },
];

export default function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <Box
      sx={{
        width: SIDEBAR_WIDTH,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.paper",
        borderRight: "1px solid",
        borderColor: "divider",
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ px: 2.5, py: 2.5 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 2.5,
            bgcolor: "primary.main",
            color: "primary.contrastText",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <TrackChangesRoundedIcon fontSize="small" />
        </Box>
        <Typography variant="h6" fontWeight={700}>
          Habit Tracker
        </Typography>
      </Stack>
      <Divider />
      <List sx={{ px: 1.5, py: 2, flex: 1 }}>
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const selected = pathname === href;
          return (
            <ListItemButton
              key={href}
              component={Link}
              href={href}
              selected={selected}
              onClick={onNavigate}
              sx={{
                borderRadius: 2.5,
                mb: 0.5,
                "&.Mui-selected": {
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  "& .MuiListItemIcon-root": { color: "inherit" },
                  "&:hover": { bgcolor: "primary.dark" },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 38 }}>
                <Icon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={label} primaryTypographyProps={{ fontWeight: 600, fontSize: 14 }} />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );
}
