'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Skeleton from '@mui/material/Skeleton';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LabelList,
} from 'recharts';
import ChecklistRoundedIcon from '@mui/icons-material/ChecklistRounded';
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded';
import TrackChangesRoundedIcon from '@mui/icons-material/TrackChangesRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import StatCard from '@/components/StatCard';
import EmptyState from '@/components/EmptyState';
import { useAuth } from '@/context/AuthContext';
import { useHabits } from '@/context/HabitsContext';
import { getDashboardSummary } from '@/lib/api';
import { getErrorMessage } from '@/lib/errors';
import { formatCount } from '@/lib/format';
import { formatDate } from '@/lib/dates';
import type { DashboardSummary, HabitWithProgress } from '@/lib/types';

const PERCENT_AXIS = {
  domain: [0, 100] as [number, number],
  ticks: [0, 25, 50, 75, 100],
  tickLine: false,
  axisLine: false,
  width: 40,
  tickFormatter: (v: number) => `${v}%`,
};

export default function DashboardPage() {
  const { user } = useAuth();
  const { setProgress } = useHabits();
  const router = useRouter();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError('');
    try {
      setSummary(await getDashboardSummary());
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) load();
  }, [user, load]);

  const toggleDone = async (habit: HabitWithProgress) => {
    setUpdatingId(habit.id);
    try {
      await setProgress(habit.id, habit.completedToday ? 0 : 100);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUpdatingId(null);
    }
  };

  const firstName = user?.name.split(' ')[0];
  const greeting = firstName ? `Hi, ${firstName}.` : 'Hi.';

  if (loading) {
    return (
      <Grid container spacing={2.5}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Skeleton variant="rounded" height={92} />
          </Grid>
        ))}
        <Grid item xs={12}>
          <Skeleton variant="rounded" height={120} />
        </Grid>
        <Grid item xs={12} md={7}>
          <Skeleton variant="rounded" height={300} />
        </Grid>
        <Grid item xs={12} md={5}>
          <Skeleton variant="rounded" height={300} />
        </Grid>
      </Grid>
    );
  }

  if (!summary) {
    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={load}>
            Try again
          </Button>
        }
      >
        {error || "Couldn't load your dashboard."}
      </Alert>
    );
  }

  if (summary.isEmpty) {
    return (
      <Box>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {greeting} This is what your progress will look like once you get
          started.
        </Typography>
        <EmptyState
          icon={TrackChangesRoundedIcon}
          title="You don't have any habits yet"
          description="Create your first habit to start seeing your streak, completion percentage and progress charts here."
          actionLabel="Create my first habit"
          onAction={() => router.push('/habits?new=1')}
        />
      </Box>
    );
  }

  const weekly = summary.weekly.map((p) => ({
    ...p,
    label: formatDate(p.date, { weekday: 'short' }),
  }));
  const monthly = summary.monthly.map((p) => ({
    ...p,
    label: formatDate(p.date),
  }));
  const tooltipFormatter = (v: unknown) =>
    [typeof v === 'number' ? `${v}%` : '—', 'Completion'] as [string, string];
  const pending = summary.habits.filter((h) => !h.completedToday).length;

  return (
    <Stack spacing={3}>
      {error && (
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Typography variant="body1" color="text.secondary">
        {greeting} Here&apos;s your summary for today.
      </Typography>

      <Grid container spacing={2.5}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={ChecklistRoundedIcon}
            label="Active habits"
            value={summary.activeCount}
            accent="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={TaskAltRoundedIcon}
            label="Completed today"
            value={`${summary.completedToday}/${summary.dueToday}`}
            accent="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={LocalFireDepartmentRoundedIcon}
            label="Current streak"
            value={formatCount(summary.currentStreak, 'day')}
            caption="Days in a row completing at least one habit"
            accent="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={EmojiEventsRoundedIcon}
            label="Best streak"
            value={formatCount(summary.bestStreak, 'day')}
            accent="secondary"
          />
        </Grid>
      </Grid>

      <Card elevation={0}>
        <CardContent>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ sm: 'center' }}
            spacing={1}
            sx={{ mb: 1.5 }}
          >
            <Typography variant="h6" fontWeight={700}>
              Today&apos;s completion
            </Typography>
            <Chip
              label={`${summary.percentToday}%`}
              color={
                summary.percentToday >= 70
                  ? 'success'
                  : summary.percentToday >= 40
                    ? 'warning'
                    : 'default'
              }
              sx={{
                fontWeight: 700,
                alignSelf: { xs: 'flex-start', sm: 'auto' },
              }}
            />
          </Stack>
          <LinearProgress
            variant="determinate"
            value={summary.percentToday}
            color={summary.percentToday >= 70 ? 'success' : 'primary'}
            aria-label="Today's completion"
            sx={{ height: 10, borderRadius: 5 }}
          />
        </CardContent>
      </Card>

      <Grid container spacing={2.5}>
        <Grid item xs={12} md={7}>
          <Card elevation={0} sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                Weekly progress
              </Typography>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart
                  data={weekly}
                  margin={{ top: 24, right: 8, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#EEF0F3"
                  />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} />
                  <YAxis {...PERCENT_AXIS} />
                  <Tooltip formatter={tooltipFormatter} />
                  <Bar
                    dataKey="percent"
                    fill="#2563EB"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={40}
                  >
                    <LabelList
                      dataKey="percent"
                      position="top"
                      formatter={(v: number | null) =>
                        v === null ? '' : `${v}%`
                      }
                      style={{ fill: '#111827', fontSize: 12, fontWeight: 600 }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={5}>
          <Card elevation={0} sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                Monthly progress (last 30 days)
              </Typography>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart
                  data={monthly}
                  margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="monthlyFill"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#7C3AED"
                        stopOpacity={0.35}
                      />
                      <stop offset="100%" stopColor="#7C3AED" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#EEF0F3"
                  />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                    minTickGap={24}
                  />
                  <YAxis {...PERCENT_AXIS} />
                  <Tooltip formatter={tooltipFormatter} />
                  <Area
                    type="monotone"
                    dataKey="percent"
                    stroke="#7C3AED"
                    strokeWidth={2.5}
                    fill="url(#monthlyFill)"
                    connectNulls
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card elevation={0}>
        <CardContent>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 1.5 }}
          >
            <Typography variant="h6" fontWeight={700}>
              Quick check-in
            </Typography>
            <Button component={Link} href="/habits" size="small">
              View all habits
            </Button>
          </Stack>
          {summary.habits.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              You have no habits scheduled for today.
            </Typography>
          ) : (
            <Stack spacing={1}>
              {pending === 0 && (
                <Alert severity="success" icon={<CheckRoundedIcon />}>
                  Nothing pending for today. Great job!
                </Alert>
              )}
              {summary.habits.map((h) => (
                <Stack
                  key={h.id}
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  spacing={1}
                  sx={{
                    p: 1.5,
                    borderRadius: 2.5,
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography fontWeight={600} noWrap>
                      {h.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {h.category} &middot;{' '}
                      {formatCount(h.streak, h.streakUnit)}
                    </Typography>
                  </Box>
                  <Chip
                    label={h.completedToday ? 'Done' : 'Mark done'}
                    color={h.completedToday ? 'success' : 'default'}
                    variant={h.completedToday ? 'filled' : 'outlined'}
                    icon={h.completedToday ? <CheckRoundedIcon /> : undefined}
                    onClick={() => toggleDone(h)}
                    disabled={updatingId === h.id}
                    sx={{ cursor: 'pointer', fontWeight: 700, flexShrink: 0 }}
                  />
                </Stack>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
}
