'use client';

import { useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import LinearProgress from '@mui/material/LinearProgress';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Box from '@mui/material/Box';
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
} from 'recharts';
import ChecklistRoundedIcon from '@mui/icons-material/ChecklistRounded';
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded';
import FlagRoundedIcon from '@mui/icons-material/FlagRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import PercentRoundedIcon from '@mui/icons-material/PercentRounded';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import StatCard from '@/components/StatCard';
import EmptyState from '@/components/EmptyState';
import { useAuth } from '@/context/AuthContext';
import { getStatistics } from '@/lib/api';
import { getErrorMessage } from '@/lib/errors';
import { formatCount } from '@/lib/format';
import { addDays, formatDate, formatMonth, todayISO } from '@/lib/dates';
import type { StatisticsSummary } from '@/lib/types';

const COLORS = [
  '#2563EB',
  '#7C3AED',
  '#16A34A',
  '#D97706',
  '#DC2626',
  '#0891B2',
];
const PRESETS = [7, 30, 90] as const;
const MAX_RANGE_DAYS = 366;

const PERCENT_AXIS = {
  domain: [0, 100] as [number, number],
  ticks: [0, 25, 50, 75, 100],
  tickLine: false,
  axisLine: false,
  width: 40,
  tickFormatter: (v: number) => `${v}%`,
};

function rangeForPreset(days: number) {
  const to = todayISO();
  return { from: addDays(to, -(days - 1)), to };
}

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card elevation={0} sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
          {title}
        </Typography>
        {children}
      </CardContent>
    </Card>
  );
}

export default function StatisticsPage() {
  const { user } = useAuth();
  const [preset, setPreset] = useState<number | null>(30);
  const [range, setRange] = useState(() => rangeForPreset(30));
  const [stats, setStats] = useState<StatisticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  const days =
    range.from && range.to
      ? Math.round((Date.parse(range.to) - Date.parse(range.from)) / 86400000) +
        1
      : 0;
  const rangeInvalid =
    !range.from || !range.to || range.from > range.to || days > MAX_RANGE_DAYS;

  useEffect(() => {
    if (!user || rangeInvalid) return;
    let cancelled = false;
    setLoading(true);
    setError('');
    getStatistics(range)
      .then((data) => !cancelled && setStats(data))
      .catch((err) => !cancelled && setError(getErrorMessage(err)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [user, range, rangeInvalid, reloadKey]);

  const choosePreset = (value: number | null) => {
    if (!value) return;
    setPreset(value);
    setRange(rangeForPreset(value));
  };

  const changeDate =
    (field: 'from' | 'to') => (e: React.ChangeEvent<HTMLInputElement>) => {
      setPreset(null);
      setRange((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const filters = (
    <Card elevation={0}>
      <CardContent>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          alignItems={{ md: 'center' }}
          justifyContent="space-between"
        >
          <ToggleButtonGroup
            size="small"
            exclusive
            color="primary"
            value={preset}
            onChange={(_, value: number | null) => choosePreset(value)}
            sx={{ flexWrap: 'wrap' }}
          >
            {PRESETS.map((p) => (
              <ToggleButton key={p} value={p} sx={{ px: 2, fontWeight: 600 }}>
                Last {p} days
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
          <Stack direction="row" spacing={1.5}>
            <TextField
              label="From"
              type="date"
              size="small"
              value={range.from}
              onChange={changeDate('from')}
              InputLabelProps={{ shrink: true }}
              inputProps={{ max: range.to || undefined }}
              error={rangeInvalid}
              sx={{ flex: 1 }}
            />
            <TextField
              label="To"
              type="date"
              size="small"
              value={range.to}
              onChange={changeDate('to')}
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: range.from || undefined }}
              error={rangeInvalid}
              sx={{ flex: 1 }}
            />
          </Stack>
        </Stack>
        {rangeInvalid && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            &quot;From&quot; must be before &quot;To&quot;.
          </Alert>
        )}
      </CardContent>
    </Card>
  );

  if (!stats) {
    if (error) {
      return (
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => setReloadKey((k) => k + 1)}
            >
              Try again
            </Button>
          }
        >
          {error || "Couldn't load your statistics."}
        </Alert>
      );
    }
    return (
      <Grid container spacing={2.5}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Grid item xs={12} sm={6} md={4} key={i}>
            <Skeleton variant="rounded" height={92} />
          </Grid>
        ))}
        <Grid item xs={12}>
          <Skeleton variant="rounded" height={280} />
        </Grid>
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

  const percentTooltip = (label: string) => (v: unknown) =>
    [typeof v === 'number' ? `${v}%` : '—', label] as [string, string];
  const daily = stats.daily.map((p) => ({
    ...p,
    label: formatDate(p.date),
  }));
  const trend = stats.trend.map((p) => ({
    ...p,
    label: `Week of ${formatDate(p.date)}`,
  }));
  const months = stats.months.map((p) => ({
    ...p,
    label: formatMonth(p.month),
  }));
  const byCategory = stats.byCategory.map((c) => ({
    ...c,
    label: c.name,
  }));

  return (
    <Stack spacing={3}>
      {filters}
      {loading && <LinearProgress sx={{ borderRadius: 1 }} />}
      {error && <Alert severity="error">{error}</Alert>}

      <Grid container spacing={2.5}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            icon={ChecklistRoundedIcon}
            label="Total habits"
            value={stats.totalHabits}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            icon={TaskAltRoundedIcon}
            label="Active habits"
            value={stats.activeHabits}
            accent="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            icon={FlagRoundedIcon}
            label="Finished habits"
            value={stats.finishedHabits}
            accent="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            icon={LocalFireDepartmentRoundedIcon}
            label="Consecutive days"
            value={formatCount(stats.currentStreak, 'day')}
            accent="error"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            icon={EmojiEventsRoundedIcon}
            label="Best streak ever"
            value={formatCount(stats.bestStreak, 'day')}
            accent="secondary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            icon={PercentRoundedIcon}
            label="Completion rate"
            value={
              stats.completion.percent === null
                ? '—'
                : `${stats.completion.percent}%`
            }
            caption={`${stats.completion.done} of ${stats.completion.due} completed`}
          />
        </Grid>
      </Grid>

      {stats.completion.due === 0 && (
        <Alert severity="info">No habits were scheduled in this range.</Alert>
      )}

      <ChartCard title="Daily completion">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart
            data={daily}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          >
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
            <Tooltip formatter={percentTooltip('Completion')} />
            <Bar
              dataKey="percent"
              fill="#16A34A"
              radius={[6, 6, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <Grid container spacing={2.5}>
        <Grid item xs={12} md={7}>
          <ChartCard title="Completion trend (by week)">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart
                data={trend}
                margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#EEF0F3"
                />
                <XAxis
                  dataKey="date"
                  tickFormatter={(d: string) => formatDate(d)}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis {...PERCENT_AXIS} />
                <Tooltip
                  labelFormatter={(_, payload) =>
                    payload?.[0]?.payload?.label ?? ''
                  }
                  formatter={percentTooltip('Completion')}
                />
                <Line
                  type="monotone"
                  dataKey="percent"
                  stroke="#2563EB"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>
        <Grid item xs={12} md={5}>
          <ChartCard title="Habits by category">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={byCategory}
                  dataKey="value"
                  nameKey="label"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                >
                  {byCategory.map((entry, i) => (
                    <Cell key={entry.name} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>
      </Grid>

      <ChartCard title="Month comparison">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart
            data={months}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#EEF0F3"
            />
            <XAxis dataKey="label" tickLine={false} axisLine={false} />
            <YAxis {...PERCENT_AXIS} />
            <Tooltip formatter={percentTooltip('Completion')} />
            <Bar dataKey="percent" radius={[6, 6, 0, 0]} maxBarSize={48}>
              {months.map((m, i) => (
                <Cell
                  key={m.month}
                  fill={i === months.length - 1 ? '#2563EB' : '#93C5FD'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Habit breakdown">
        <TableContainer sx={{ mx: -2, width: 'auto' }}>
          <Table size="small" sx={{ minWidth: 640 }}>
            <TableHead>
              <TableRow>
                <TableCell>Habit</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Frequency</TableCell>
                <TableCell align="right">Completed</TableCell>
                <TableCell sx={{ minWidth: 140 }}>Rate</TableCell>
                <TableCell align="right">Streak</TableCell>
                <TableCell align="right">Best</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stats.habits.map((h) => (
                <TableRow key={h.id} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{h.name}</TableCell>
                  <TableCell>{h.category}</TableCell>
                  <TableCell>{h.frequency}</TableCell>
                  <TableCell align="right">
                    {h.done}/{h.due}
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Box sx={{ flex: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={h.percent ?? 0}
                          color={(h.percent ?? 0) >= 70 ? 'success' : 'primary'}
                          sx={{ height: 6, borderRadius: 3 }}
                        />
                      </Box>
                      <Typography
                        variant="caption"
                        fontWeight={700}
                        sx={{ minWidth: 34 }}
                      >
                        {h.percent === null ? '—' : `${h.percent}%`}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell align="right">
                    {formatCount(h.streak, h.streakUnit)}
                  </TableCell>
                  <TableCell align="right">
                    {formatCount(h.bestStreak, h.streakUnit)}
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={h.active ? 'Active' : 'Inactive'}
                      color={h.active ? 'success' : 'default'}
                      variant={h.active ? 'filled' : 'outlined'}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </ChartCard>
    </Stack>
  );
}
