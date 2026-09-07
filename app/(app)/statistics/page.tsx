"use client";

import { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Skeleton from "@mui/material/Skeleton";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
  LabelList,
} from "recharts";
import ChecklistRoundedIcon from "@mui/icons-material/ChecklistRounded";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import FlagRoundedIcon from "@mui/icons-material/FlagRounded";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import StatCard from "@/components/StatCard";
import EmptyState from "@/components/EmptyState";
import { useAuth } from "@/context/AuthContext";
import { getStatistics } from "@/lib/api";
import type { StatisticsSummary } from "@/lib/types";

const COLORS = ["#2563EB", "#7C3AED", "#16A34A", "#D97706", "#DC2626", "#0891B2"];

export default function StatisticsPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<StatisticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      const data = await getStatistics(user.id);
      setStats(data);
      setLoading(false);
    })();
  }, [user]);

  if (loading || !stats) {
    return (
      <Grid container spacing={2.5}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Skeleton variant="rounded" height={92} />
          </Grid>
        ))}
      </Grid>
    );
  }

  if (stats.totalHabits === 0) {
    return (
      <EmptyState
        icon={InsightsRoundedIcon}
        title="No statistics yet"
        description="Once you create habits and start marking them, you'll see your overall progress, trends and a breakdown by category here."
      />
    );
  }

  return (
    <Stack spacing={3}>
      <Grid container spacing={2.5}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard icon={ChecklistRoundedIcon} label="Total habits" value={stats.totalHabits} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={TaskAltRoundedIcon}
            label="Active habits"
            value={stats.activeHabits}
            accent="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={FlagRoundedIcon}
            label="Finished habits"
            value={stats.finishedHabits}
            accent="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={EmojiEventsRoundedIcon}
            label="Best streak ever"
            value={`${stats.bestStreak} day${stats.bestStreak === 1 ? "" : "s"}`}
            accent="secondary"
          />
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        <Grid item xs={12} md={7}>
          <Card elevation={0} sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                Completion trend (last 4 weeks)
              </Typography>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={stats.monthly}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EEF0F3" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} />
                  <YAxis
                    domain={[0, 100]}
                    ticks={[0, 25, 50, 75, 100]}
                    tickLine={false}
                    axisLine={false}
                    width={40}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip formatter={(v: number) => [`${v}%`, "Average"]} />
                  <Line type="monotone" dataKey="percent" stroke="#2563EB" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={5}>
          <Card elevation={0} sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                Habits by category
              </Typography>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={stats.byCategory}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                  >
                    {stats.byCategory.map((entry, i) => (
                      <Cell key={entry.name} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card elevation={0}>
        <CardContent>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
            Daily completion (last 7 days)
          </Typography>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={stats.weekly} margin={{ top: 24, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EEF0F3" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} />
              <YAxis
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
                tickLine={false}
                axisLine={false}
                width={40}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip formatter={(v: number) => [`${v}%`, "Completion"]} />
              <Bar dataKey="percent" fill="#16A34A" radius={[6, 6, 0, 0]} maxBarSize={40}>
                <LabelList
                  dataKey="percent"
                  position="top"
                  formatter={(v: number) => `${v}%`}
                  style={{ fill: "#111827", fontSize: 12, fontWeight: 600 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </Stack>
  );
}
