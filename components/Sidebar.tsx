'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Badge from '@mui/material/Badge';
import SpaceDashboardRoundedIcon from '@mui/icons-material/SpaceDashboardRounded';
import ChecklistRoundedIcon from '@mui/icons-material/ChecklistRounded';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import TrackChangesRoundedIcon from '@mui/icons-material/TrackChangesRounded';
import type SvgIcon from '@mui/material/SvgIcon';
import { useAuth } from '@/context/AuthContext';
import { useHabits } from '@/context/HabitsContext';

export const SIDEBAR_WIDTH = 248;

const NAV_ITEMS: { href: string; label: string; icon: typeof SvgIcon }[] = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: SpaceDashboardRoundedIcon,
  },
  { href: '/habits', label: 'Habits', icon: ChecklistRoundedIcon },
  {
    href: '/statistics',
    label: 'Statistics',
    icon: InsightsRoundedIcon,
  },
  { href: '/profile', label: 'Profile', icon: PersonRoundedIcon },
];

const itemSx = {
  borderRadius: 2.5,
  mb: 0.5,
  '&.Mui-selected': {
    bgcolor: 'primary.main',
    color: 'primary.contrastText',
    '& .MuiListItemIcon-root': { color: 'inherit' },
    '&:hover': { bgcolor: 'primary.dark' },
  },
};

export default function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const { habits } = useHabits();
  const pendingToday = habits.filter((h) => h.dueToday).length;

  return (
    <Box
      sx={{
        width: SIDEBAR_WIDTH,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
        borderRight: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Stack
        direction="row"
        spacing={1.5}
        alignItems="center"
        sx={{ px: 2.5, py: 2.5 }}
      >
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 2.5,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <TrackChangesRoundedIcon fontSize="small" />
        </Box>
        <Typography variant="h6" fontWeight={700}>
          Habit Tracker
        </Typography>
      </Stack>
      <Divider />
      <List component="nav" sx={{ px: 1.5, py: 2, flex: 1 }}>
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const selected = pathname === href;
          const showBadge = href === '/habits' && pendingToday > 0;
          return (
            <ListItemButton
              key={href}
              component={Link}
              href={href}
              selected={selected}
              onClick={onNavigate}
              aria-current={selected ? 'page' : undefined}
              sx={itemSx}
            >
              <ListItemIcon sx={{ minWidth: 38 }}>
                <Icon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={label}
                primaryTypographyProps={{ fontWeight: 600, fontSize: 14 }}
              />
              {showBadge && (
                <Badge
                  badgeContent={pendingToday}
                  color={selected ? 'secondary' : 'primary'}
                  aria-label={`${pendingToday} habits pending today`}
                  sx={{ mr: 1 }}
                />
              )}
            </ListItemButton>
          );
        })}
      </List>
      <Divider />
      <List sx={{ px: 1.5, py: 1.5 }}>
        <ListItemButton
          onClick={() => {
            onNavigate?.();
            logout();
          }}
          sx={itemSx}
        >
          <ListItemIcon sx={{ minWidth: 38 }}>
            <LogoutRoundedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary="Log out"
            primaryTypographyProps={{ fontWeight: 600, fontSize: 14 }}
          />
        </ListItemButton>
      </List>
    </Box>
  );
}
