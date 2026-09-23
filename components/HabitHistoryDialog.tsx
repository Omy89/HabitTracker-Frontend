'use client';

import { useCallback, useEffect, useState } from 'react';
import dayjs, { type Dayjs } from 'dayjs';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import LinearProgress from '@mui/material/LinearProgress';
import Chip from '@mui/material/Chip';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import {
  PickersDay,
  type PickersDayProps,
} from '@mui/x-date-pickers/PickersDay';
import * as api from '@/lib/api';
import { formatCount } from '@/lib/format';
import { getErrorMessage } from '@/lib/errors';
import type { HabitWithProgress, PeriodProgress } from '@/lib/types';

type ProgressByDate = Record<string, number>;

interface HistoryDayProps extends PickersDayProps<Dayjs> {
  progressByDate?: ProgressByDate;
}

function HistoryDay({ progressByDate = {}, day, ...other }: HistoryDayProps) {
  const progress = progressByDate[day.format('YYYY-MM-DD')] ?? 0;
  const done = progress >= 100;
  const partial = progress > 0 && !done;
  return (
    <PickersDay
      {...other}
      day={day}
      sx={{
        fontWeight: done || partial ? 700 : 400,
        ...(done && {
          bgcolor: 'success.main',
          color: 'common.white',
          '&:hover, &:focus': { bgcolor: 'success.dark' },
        }),
        ...(partial && {
          border: '2px solid',
          borderColor: 'warning.main',
        }),
      }}
    />
  );
}

function SummaryItem({
  label,
  value,
  progress,
}: {
  label: string;
  value: string;
  progress?: PeriodProgress;
}) {
  return (
    <Box
      sx={{
        flex: '1 1 120px',
        p: 1.5,
        borderRadius: 2.5,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h6" fontWeight={700} lineHeight={1.3}>
        {value}
      </Typography>
      {progress && (
        <LinearProgress
          variant="determinate"
          value={progress.percent ?? 0}
          color={(progress.percent ?? 0) >= 70 ? 'success' : 'primary'}
          sx={{ mt: 1, height: 6, borderRadius: 3 }}
        />
      )}
    </Box>
  );
}

function progressLabel(progress: PeriodProgress, noData: string): string {
  if (!progress.due) return noData;
  return `${progress.done}/${progress.due} · ${progress.percent}%`;
}

interface HabitHistoryDialogProps {
  open: boolean;
  habit: HabitWithProgress | null;
  onClose: () => void;
  onSetProgress: (
    id: string,
    progress: number,
    date: string,
  ) => Promise<unknown>;
}

export default function HabitHistoryDialog({
  open,
  habit,
  onClose,
  onSetProgress,
}: HabitHistoryDialogProps) {
  const [month, setMonth] = useState<Dayjs>(() => dayjs());
  const [progressByDate, setProgressByDate] = useState<ProgressByDate>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const habitId = habit?.id;

  const load = useCallback(async () => {
    if (!habitId) return;
    setLoading(true);
    setError('');
    try {
      const records = await api.getHabitRecords(habitId, {
        from: month.startOf('month').format('YYYY-MM-DD'),
        to: month.endOf('month').format('YYYY-MM-DD'),
      });
      setProgressByDate(
        Object.fromEntries(records.map((r) => [r.date, r.progress])),
      );
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [habitId, month]);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  // Start on the current month the next time the dialog opens.
  useEffect(() => {
    if (!open) setMonth(dayjs());
  }, [open]);

  if (!habit) return null;

  const readOnly = !habit.active || saving;

  const handleDayClick = async (value: Dayjs | null) => {
    if (!value || readOnly) return;
    const date = value.format('YYYY-MM-DD');
    const next = (progressByDate[date] ?? 0) >= 100 ? 0 : 100;
    setSaving(true);
    setError('');
    // Optimistic update so the calendar reacts right away.
    setProgressByDate((prev) => ({ ...prev, [date]: next }));
    try {
      await onSetProgress(habit.id, next, date);
    } catch (err) {
      setError(getErrorMessage(err));
      load();
    } finally {
      setSaving(false);
    }
  };

  const completedThisMonth = Object.values(progressByDate).filter(
    (p) => p >= 100,
  ).length;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="habit-history-title"
    >
      <DialogTitle
        id="habit-history-title"
        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="caption" color="text.secondary" display="block">
            History
          </Typography>
          <Typography variant="h6" fontWeight={700} noWrap>
            {habit.name}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" aria-label="Close">
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <Stack direction="row" flexWrap="wrap" gap={1.5}>
            <SummaryItem
              label="Current streak"
              value={formatCount(habit.streak, habit.streakUnit)}
            />
            <SummaryItem
              label="Best streak"
              value={formatCount(habit.bestStreak, habit.streakUnit)}
            />
            <SummaryItem
              label="This week"
              value={progressLabel(habit.week, 'No data')}
              progress={habit.week}
            />
            <SummaryItem
              label="This month"
              value={progressLabel(habit.month, 'No data')}
              progress={habit.month}
            />
          </Stack>

          {error && <Alert severity="error">{error}</Alert>}

          <Box sx={{ position: 'relative' }}>
            {(loading || saving) && (
              <LinearProgress
                sx={{ position: 'absolute', top: 0, left: 0, right: 0 }}
              />
            )}
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateCalendar
                value={null}
                referenceDate={month}
                onChange={handleDayClick}
                onMonthChange={(value) => setMonth(value)}
                views={['day']}
                disableFuture
                minDate={dayjs(habit.startDate)}
                maxDate={habit.endDate ? dayjs(habit.endDate) : undefined}
                readOnly={readOnly}
                slots={{ day: HistoryDay }}
                slotProps={{
                  day: { progressByDate } as Partial<HistoryDayProps>,
                }}
                sx={{ width: '100%', maxWidth: 360, mx: 'auto' }}
              />
            </LocalizationProvider>
          </Box>

          <Stack
            direction="row"
            spacing={1}
            flexWrap="wrap"
            justifyContent="center"
            alignItems="center"
            useFlexGap
          >
            <Chip
              size="small"
              label="Completed"
              sx={{ bgcolor: 'success.main', color: 'common.white' }}
            />
            <Chip
              size="small"
              variant="outlined"
              label="Partial"
              sx={{ borderColor: 'warning.main', borderWidth: 2 }}
            />
            <Typography variant="caption" color="text.secondary">
              Days completed: {completedThisMonth}
            </Typography>
          </Stack>

          <Typography variant="body2" color="text.secondary" textAlign="center">
            {habit.active
              ? 'Tap a past day to mark it as done or undo it.'
              : 'Activate the habit to update its history.'}
          </Typography>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
