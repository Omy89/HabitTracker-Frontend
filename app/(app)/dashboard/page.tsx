"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import LinearProgress from "@mui/material/LinearProgress";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Skeleton from "@mui/material/Skeleton";
import ChecklistRoundedIcon from "@mui/icons-material/ChecklistRounded";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import TrackChangesRoundedIcon from "@mui/icons-material/TrackChangesRounded";
import StatCard from "@/components/StatCard";
import EmptyState from "@/components/EmptyState";
import { useAuth } from "@/context/AuthContext";
import { getDashboardSummary } from "@/lib/api";
import { useHabits } from "@/context/HabitsContext";
import type { DashboardSummary } from "@/lib/types";

export default function DashboardPage() {
  const { user } = useAuth();
  const { setProgress } = useHabits();
  const router = useRouter();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const data = await getDashboardSummary(user.id);
    setSummary(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (loading || !summary) {
    return (
      <Grid container spacing={2.5}>
        {Array.from({ length: 2 }).map((_, i) => (
          <Grid item xs={12} sm={6} key={i}>
            <Skeleton variant="rounded" height={92} />
          </Grid>
        ))}
        <Grid item xs={12}>
          <Skeleton variant="rounded" height={280} />
        </Grid>
      </Grid>
    );
  }

  if (summary.isEmpty) {
    return (
      <Box>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Hi{user?.name ? `, ${user.name.split(" ")[0]}` : ""}. This is what your progress
          will look like once you get started.
        </Typography>
        <EmptyState
          icon={TrackChangesRoundedIcon}
          title="You don't have any habits yet"
          description="Create your first habit to start seeing your completion percentage here."
          actionLabel="Create my first habit"
          onAction={() => router.push("/habits?new=1")}
        />
      </Box>
    );
  }

  return (
    <Stack spacing={3}>
      <Typography variant="body1" color="text.secondary">
        Hi{user?.name ? `, ${user.name.split(" ")[0]}` : ""}. Here's your summary for today.
      </Typography>

      <Grid container spacing={2.5}>
        <Grid item xs={12} sm={6}>
          <StatCard
            icon={ChecklistRoundedIcon}
            label="Active habits"
            value={summary.activeCount}
            accent="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <StatCard
            icon={TaskAltRoundedIcon}
            label="Completed today"
            value={`${summary.completedToday}/${summary.activeCount}`}
            accent="success"
          />
        </Grid>
      </Grid>

      <Card elevation={0}>
        <CardContent>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ sm: "center" }}
            spacing={1}
            sx={{ mb: 1.5 }}
          >
            <Typography variant="h6" fontWeight={700}>
              Today's completion
            </Typography>
            <Chip
              label={`${summary.percentToday}%`}
              color={summary.percentToday >= 70 ? "success" : summary.percentToday >= 40 ? "warning" : "default"}
              sx={{ fontWeight: 700 }}
            />
          </Stack>
          <LinearProgress
            variant="determinate"
            value={summary.percentToday}
            sx={{ height: 10, borderRadius: 5 }}
          />
        </CardContent>
      </Card>

      <Card elevation={0}>
        <CardContent>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 1.5 }}>
            Quick check-in
          </Typography>
          <Stack spacing={1}>
            {summary.habits.map((h) => (
              <Stack
                key={h.id}
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{
                  p: 1.5,
                  borderRadius: 2.5,
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography fontWeight={600} noWrap>
                    {h.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {h.category} &middot; {h.frequency}
                  </Typography>
                </Box>
                <Chip
                  label={h.completedToday ? "Done" : "Mark done"}
                  color={h.completedToday ? "success" : "default"}
                  variant={h.completedToday ? "filled" : "outlined"}
                  onClick={async () => {
                    await setProgress(h.id, h.completedToday ? 0 : 100);
                    load();
                  }}
                  sx={{ cursor: "pointer", fontWeight: 700 }}
                />
              </Stack>
            ))}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
