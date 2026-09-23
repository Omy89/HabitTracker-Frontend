'use client';

import { useEffect, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import FormHelperText from '@mui/material/FormHelperText';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { habitSchema, zodErrors } from '@/lib/schemas';
import { todayISO } from '@/lib/dates';
import { getErrorMessage } from '@/lib/errors';
import { CATEGORIES, FREQUENCIES, PRIORITIES, WEEKDAYS } from '@/lib/types';
import type {
  Frequency,
  HabitFormValues,
  HabitWithProgress,
  Priority,
} from '@/lib/types';

function emptyForm(): HabitFormValues {
  return {
    name: '',
    description: '',
    category: 'General',
    frequency: 'Daily',
    days: [],
    priority: 'Medium',
    startDate: todayISO(),
    endDate: '',
  };
}

/** Short weekday name; 2024-01-07 was a Sunday. */
function weekdayLabel(day: number): string {
  return new Date(2024, 0, 7 + day).toLocaleDateString('en-US', {
    weekday: 'short',
  });
}

const FREQUENCY_HELP: Record<Frequency, string> = {
  Daily: 'Every day.',
  Weekly: 'Once a week, any day.',
  Custom: 'Only on the days you choose.',
};

const PRIORITY_COLOR: Record<Priority, 'error' | 'warning' | 'default'> = {
  High: 'error',
  Medium: 'warning',
  Low: 'default',
};

interface ChipOption<T> {
  value: T;
  label: string;
  color?: 'primary' | 'error' | 'warning' | 'default';
}

interface ChipFieldProps<T> {
  label: string;
  options: ChipOption<T>[];
  isSelected: (value: T) => boolean;
  onToggle: (value: T) => void;
  helperText?: string;
  error?: boolean;
}

/** A labeled row of clickable chips; selected chips are filled. */
function ChipField<T extends string | number>({
  label,
  options,
  isSelected,
  onToggle,
  helperText,
  error,
}: ChipFieldProps<T>) {
  return (
    <FormControl error={error} component="fieldset">
      <FormLabel component="legend" sx={{ mb: 1, fontSize: 14 }}>
        {label}
      </FormLabel>
      <Stack direction="row" flexWrap="wrap" gap={1}>
        {options.map((option) => {
          const selected = isSelected(option.value);
          const color = option.color ?? 'primary';
          return (
            <Chip
              key={option.value}
              label={option.label}
              clickable
              color={selected ? color : 'default'}
              variant={selected ? 'filled' : 'outlined'}
              onClick={() => onToggle(option.value)}
              aria-pressed={selected}
              sx={{ fontWeight: 600, px: 0.5 }}
            />
          );
        })}
      </Stack>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
}

interface HabitFormDialogProps {
  open: boolean;
  habit: HabitWithProgress | null;
  onClose: () => void;
  onSubmit: (data: HabitFormValues) => Promise<void>;
}

export default function HabitFormDialog({
  open,
  habit,
  onClose,
  onSubmit,
}: HabitFormDialogProps) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [form, setForm] = useState<HabitFormValues>(emptyForm);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const isEdit = !!habit;

  useEffect(() => {
    if (open) {
      setForm(
        habit
          ? {
              name: habit.name,
              description: habit.description || '',
              category: habit.category,
              frequency: habit.frequency,
              days: habit.days ?? [],
              priority: habit.priority,
              startDate: habit.startDate,
              endDate: habit.endDate || '',
            }
          : emptyForm(),
      );
      setTouched({});
      setFormError('');
    }
  }, [open, habit]);

  const errors = zodErrors(habitSchema, form);
  const error = (field: string) =>
    touched[field] && errors[field] ? errors[field] : undefined;

  const handleChange =
    (field: keyof HabitFormValues) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(
        (prev) => ({ ...prev, [field]: e.target.value }) as HabitFormValues,
      );

  const handleBlur = (field: string) => () =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({
      name: true,
      description: true,
      days: true,
      startDate: true,
      endDate: true,
    });
    setFormError('');
    const result = habitSchema.safeParse(form);
    if (!result.success) return;
    setSubmitting(true);
    try {
      await onSubmit(result.data);
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      fullScreen={fullScreen}
      aria-labelledby="habit-form-title"
    >
      <DialogTitle
        id="habit-form-title"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span>{isEdit ? 'Edit habit' : 'Create habit'}</span>
        <IconButton onClick={handleClose} size="small" aria-label="Close">
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <Stack
        component="form"
        onSubmit={handleSubmit}
        noValidate
        sx={{ flex: 1 }}
      >
        <DialogContent dividers>
          <Stack spacing={2.5}>
            {formError && <Alert severity="error">{formError}</Alert>}

            <TextField
              label="Habit name"
              fullWidth
              autoFocus
              required
              value={form.name}
              onChange={handleChange('name')}
              onBlur={handleBlur('name')}
              error={!!error('name')}
              helperText={error('name') ?? `${form.name.length}/60`}
              placeholder="E.g. Read for 20 minutes"
              inputProps={{ maxLength: 60 }}
            />

            <TextField
              label="Description (optional)"
              fullWidth
              multiline
              minRows={2}
              value={form.description}
              onChange={handleChange('description')}
              onBlur={handleBlur('description')}
              error={!!error('description')}
              helperText={
                error('description') ?? `${form.description.length}/300`
              }
              placeholder="What does this habit involve?"
              inputProps={{ maxLength: 300 }}
            />

            <ChipField
              label="Category"
              options={CATEGORIES.map((c) => ({ value: c, label: c }))}
              isSelected={(c) => form.category === c}
              onToggle={(category) =>
                setForm((prev) => ({ ...prev, category }))
              }
            />

            <ChipField
              label="Priority"
              options={PRIORITIES.map((p) => ({
                value: p,
                label: p,
                color: PRIORITY_COLOR[p],
              }))}
              isSelected={(p) => form.priority === p}
              onToggle={(priority) =>
                setForm((prev) => ({ ...prev, priority }))
              }
            />

            <ChipField
              label="Frequency"
              options={FREQUENCIES.map((f) => ({ value: f, label: f }))}
              isSelected={(f) => form.frequency === f}
              onToggle={(frequency) =>
                setForm((prev) => ({ ...prev, frequency }))
              }
              helperText={FREQUENCY_HELP[form.frequency]}
            />

            {form.frequency === 'Custom' && (
              <ChipField
                label="Days of the week"
                options={WEEKDAYS.map((d) => ({
                  value: d,
                  label: weekdayLabel(d),
                }))}
                isSelected={(d) => form.days.includes(d)}
                onToggle={(day) => {
                  setForm((prev) => ({
                    ...prev,
                    days: prev.days.includes(day)
                      ? prev.days.filter((d) => d !== day)
                      : [...prev.days, day],
                  }));
                  setTouched((prev) => ({ ...prev, days: true }));
                }}
                error={!!error('days')}
                helperText={error('days')}
              />
            )}

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Start date"
                  type="date"
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                  value={form.startDate}
                  onChange={handleChange('startDate')}
                  onBlur={handleBlur('startDate')}
                  error={!!error('startDate')}
                  helperText={error('startDate')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="End date (optional)"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ min: form.startDate || undefined }}
                  value={form.endDate}
                  onChange={handleChange('endDate')}
                  onBlur={handleBlur('endDate')}
                  error={!!error('endDate')}
                  helperText={error('endDate')}
                />
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleClose} color="inherit" disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={submitting}>
            {submitting
              ? 'Saving...'
              : isEdit
                ? 'Save changes'
                : 'Create habit'}
          </Button>
        </DialogActions>
      </Stack>
    </Dialog>
  );
}
