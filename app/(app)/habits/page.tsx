'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Fab from '@mui/material/Fab';
import Chip from '@mui/material/Chip';
import Switch from '@mui/material/Switch';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import InputAdornment from '@mui/material/InputAdornment';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import ChecklistRoundedIcon from '@mui/icons-material/ChecklistRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import HabitFormDialog from '@/components/HabitFormDialog';
import HabitHistoryDialog from '@/components/HabitHistoryDialog';
import ConfirmDialog from '@/components/ConfirmDialog';
import EmptyState from '@/components/EmptyState';
import CompletionBar from '@/components/CompletionBar';
import { useHabits } from '@/context/HabitsContext';
import { getErrorMessage } from '@/lib/errors';
import { formatCount } from '@/lib/format';
import {
  WEEKDAYS,
  type HabitFormValues,
  type HabitWithProgress,
  type Priority,
} from '@/lib/types';

const PRIORITY_COLOR: Record<Priority, 'error' | 'warning' | 'default'> = {
  High: 'error',
  Medium: 'warning',
  Low: 'default',
};

const ALL = 'All';

interface SnackbarState {
  severity: 'success' | 'error';
  message: string;
}

function HabitsPageContent() {
  const {
    habits,
    loading,
    error: loadError,
    reload,
    createHabit,
    updateHabit,
    deleteHabit,
    toggleActive,
    setProgress,
  } = useHabits();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<HabitWithProgress | null>(
    null,
  );
  const [historyHabitId, setHistoryHabitId] = useState<string | null>(null);
  const [deletingHabit, setDeletingHabit] = useState<HabitWithProgress | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(ALL);
  const [snackbar, setSnackbar] = useState<SnackbarState | null>(null);

  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setDialogOpen(true);
      router.replace('/habits');
    }
  }, [searchParams, router]);

  const categories = useMemo(
    () => [ALL, ...new Set(habits.map((h) => h.category))],
    [habits],
  );

  const query = search.trim().toLowerCase();
  const filtered = habits.filter((h) => {
    const matchesSearch = h.name.toLowerCase().includes(query);
    const matchesCategory =
      categoryFilter === ALL || h.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const historyHabit = habits.find((h) => h.id === historyHabitId) ?? null;

  const showError = (err: unknown) =>
    setSnackbar({ severity: 'error', message: getErrorMessage(err) });

  const openCreate = () => {
    setEditingHabit(null);
    setDialogOpen(true);
  };

  const openEdit = (habit: HabitWithProgress) => {
    setEditingHabit(habit);
    setDialogOpen(true);
  };

  const handleSubmit = async (data: HabitFormValues) => {
    if (editingHabit) {
      await updateHabit(editingHabit.id, data);
      setSnackbar({ severity: 'success', message: 'Habit updated.' });
    } else {
      await createHabit(data);
      setSnackbar({ severity: 'success', message: 'Habit created.' });
    }
    setDialogOpen(false);
  };

  const handleDelete = async () => {
    if (!deletingHabit) return;
    setDeleting(true);
    try {
      await deleteHabit(deletingHabit.id);
      setSnackbar({ severity: 'success', message: 'Habit deleted.' });
      setDeletingHabit(null);
    } catch (err) {
      showError(err);
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleActive = async (habit: HabitWithProgress) => {
    try {
      const updated = await toggleActive(habit.id);
      setSnackbar({
        severity: 'success',
        message: updated.active ? 'Habit activated.' : 'Habit deactivated.',
      });
    } catch (err) {
      showError(err);
    }
  };

  const handleProgress = async (habit: HabitWithProgress, value: number) => {
    try {
      const updated = await setProgress(habit.id, value);
      if (updated.completedToday && !habit.completedToday) {
        setSnackbar({
          severity: 'success',
          message: 'Completed! Keep it up.',
        });
      }
    } catch (err) {
      showError(err);
    }
  };

  const frequencyLabel = (h: HabitWithProgress) => {
    const base = h.frequency;
    if (h.frequency !== 'Custom' || !h.days.length) return base;
    const days = WEEKDAYS.filter((d) => h.days.includes(d))
      .map((d) =>
        new Date(2024, 0, 7 + d).toLocaleDateString('en-US', {
          weekday: 'short',
        }),
      )
      .join(', ');
    return `${base} · ${days}`;
  };

  const renderList = () => {
    if (loading) {
      return (
        <Stack spacing={2}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={104} />
          ))}
        </Stack>
      );
    }
    if (loadError) {
      return (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={reload}>
              Try again
            </Button>
          }
        >
          Couldn&apos;t load your habits.
        </Alert>
      );
    }
    if (habits.length === 0) {
      return (
        <EmptyState
          icon={ChecklistRoundedIcon}
          title="Create your first habit"
          description="Set a name, frequency and priority. You can edit or deactivate it anytime."
          actionLabel="Create habit"
          onAction={openCreate}
        />
      );
    }
    if (filtered.length === 0) {
      return (
        <EmptyState
          icon={SearchRoundedIcon}
          title="No results"
          description="No habit matches your search or filter."
        />
      );
    }
    return (
      <Stack spacing={2}>
        {filtered.map((h) => {
          const priorityColor = PRIORITY_COLOR[h.priority];
          const accentColor =
            priorityColor === 'default' ? 'grey.400' : `${priorityColor}.main`;
          const weeklyDone =
            h.frequency === 'Weekly' && !h.dueToday && !h.completedToday;
          return (
            <Paper
              key={h.id}
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                borderLeft: '5px solid',
                borderLeftColor: accentColor,
                opacity: h.active ? 1 : 0.6,
              }}
            >
              <Stack
                direction={{ xs: 'column', md: 'row' }}
                spacing={{ xs: 2, md: 3 }}
                alignItems={{ md: 'center' }}
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    flexWrap="wrap"
                  >
                    <Typography variant="h6" fontWeight={700} noWrap>
                      {h.name}
                    </Typography>
                    <Chip
                      size="small"
                      label={h.priority}
                      color={priorityColor}
                    />
                  </Stack>
                  {h.description && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 0.5, mb: 1 }}
                    >
                      {h.description}
                    </Typography>
                  )}
                  <Stack direction="row" gap={1} flexWrap="wrap" sx={{ mt: 1 }}>
                    <Chip size="small" variant="outlined" label={h.category} />
                    <Chip
                      size="small"
                      variant="outlined"
                      label={frequencyLabel(h)}
                    />
                    <Tooltip title="Current streak">
                      <Chip
                        size="small"
                        variant="outlined"
                        color={h.streak > 0 ? 'warning' : 'default'}
                        icon={
                          <LocalFireDepartmentRoundedIcon fontSize="small" />
                        }
                        label={formatCount(h.streak, h.streakUnit)}
                      />
                    </Tooltip>
                  </Stack>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', mt: 1 }}
                  >
                    {`This week: ${h.week.done}/${h.week.due}`}
                    {' · '}
                    {`This month: ${h.month.done}/${h.month.due}`}
                  </Typography>
                </Box>

                {h.active && !h.scheduledToday ? (
                  <Chip
                    label="Not scheduled today"
                    sx={{ alignSelf: { md: 'center' } }}
                  />
                ) : weeklyDone ? (
                  <Chip
                    color="success"
                    label="Done this week"
                    sx={{ alignSelf: { md: 'center' } }}
                  />
                ) : (
                  <CompletionBar
                    value={h.todayProgress}
                    disabled={!h.active}
                    label={`Today's progress for ${h.name}`}
                    onCommit={(v) => handleProgress(h, v)}
                  />
                )}

                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Tooltip title={h.active ? 'Deactivate' : 'Activate'}>
                    <Switch
                      checked={h.active}
                      onChange={() => handleToggleActive(h)}
                      size="small"
                      inputProps={{
                        'aria-label': h.active ? 'Deactivate' : 'Activate',
                      }}
                    />
                  </Tooltip>
                  <Tooltip title="History">
                    <IconButton
                      onClick={() => setHistoryHabitId(h.id)}
                      aria-label="History"
                    >
                      <CalendarMonthRoundedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit">
                    <IconButton onClick={() => openEdit(h)} aria-label="Edit">
                      <EditRoundedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      color="error"
                      onClick={() => setDeletingHabit(h)}
                      aria-label="Delete"
                    >
                      <DeleteOutlineRoundedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Stack>
            </Paper>
          );
        })}
      </Stack>
    );
  };

  return (
    <Box sx={{ pb: 12 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        alignItems={{ sm: 'center' }}
        justifyContent="space-between"
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h6" fontWeight={700}>
            Your habits
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Mark your progress, check the history, or edit them anytime.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5}>
          <TextField
            size="small"
            placeholder="Search habit..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            inputProps={{ 'aria-label': 'Search habits' }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ flex: 1 }}
          />
          <TextField
            select
            size="small"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            inputProps={{ 'aria-label': 'Filter by category' }}
            sx={{ minWidth: 150 }}
          >
            {categories.map((c) => (
              <MenuItem key={c} value={c}>
                {c === ALL ? 'All categories' : c}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </Stack>

      {renderList()}

      <Fab
        variant="extended"
        color="primary"
        onClick={openCreate}
        sx={{
          position: 'fixed',
          bottom: { xs: 16, sm: 32 },
          right: { xs: 16, sm: 32 },
          height: 56,
          minWidth: 220,
          px: 4,
          gap: 1,
          fontSize: '1rem',
          fontWeight: 700,
          textTransform: 'none',
          boxShadow: '0 8px 20px rgba(37,99,235,0.35)',
        }}
      >
        <AddRoundedIcon />
        Add habit
      </Fab>

      <HabitFormDialog
        open={dialogOpen}
        habit={editingHabit}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
      />

      <HabitHistoryDialog
        open={!!historyHabit}
        habit={historyHabit}
        onClose={() => setHistoryHabitId(null)}
        onSetProgress={setProgress}
      />

      <ConfirmDialog
        open={!!deletingHabit}
        title="Delete habit"
        description={`Are you sure you want to delete "${deletingHabit?.name ?? ''}"? This can't be undone and its history will be lost.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        loadingLabel="Deleting..."
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setDeletingHabit(null)}
      />

      <Snackbar
        open={!!snackbar}
        autoHideDuration={3000}
        onClose={() => setSnackbar(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        {snackbar ? (
          <Alert
            severity={snackbar.severity}
            variant="filled"
            onClose={() => setSnackbar(null)}
          >
            {snackbar.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </Box>
  );
}

export default function HabitsPage() {
  return (
    <Suspense>
      <HabitsPageContent />
    </Suspense>
  );
}
