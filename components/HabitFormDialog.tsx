"use client";

import { useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Grid from "@mui/material/Grid";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { habitSchema } from "@/lib/schemas";
import { CATEGORIES, FREQUENCIES, PRIORITIES } from "@/lib/types";
import type { HabitFormValues, HabitWithProgress } from "@/lib/types";

const emptyForm: HabitFormValues = {
  name: "",
  description: "",
  category: "General",
  frequency: "Daily",
  priority: "Medium",
  startDate: new Date().toISOString().slice(0, 10),
  endDate: "",
};

interface HabitFormDialogProps {
  open: boolean;
  habit: HabitWithProgress | null;
  onClose: () => void;
  onSubmit: (data: HabitFormValues) => Promise<void>;
}

export default function HabitFormDialog({ open, habit, onClose, onSubmit }: HabitFormDialogProps) {
  const [form, setForm] = useState<HabitFormValues>(emptyForm);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const isEdit = !!habit;

  useEffect(() => {
    if (open) {
      setForm(
        habit
          ? {
              name: habit.name,
              description: habit.description || "",
              category: habit.category,
              frequency: habit.frequency,
              priority: habit.priority,
              startDate: habit.startDate,
              endDate: habit.endDate || "",
            }
          : emptyForm
      );
      setTouched({});
      setFormError("");
    }
  }, [open, habit]);

  const result = habitSchema.safeParse(form);
  const errors: Record<string, string> = {};
  if (!result.success) {
    result.error.issues.forEach((issue) => {
      const key = issue.path.join(".");
      if (!errors[key]) errors[key] = issue.message;
    });
  }

  const handleChange =
    (field: keyof HabitFormValues) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }) as HabitFormValues);

  const handleBlur = (field: string) => () => setTouched((prev) => ({ ...prev, [field]: true }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, startDate: true, endDate: true });
    setFormError("");
    if (!result.success) return;
    setSubmitting(true);
    try {
      await onSubmit(result.data);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Couldn't save the habit.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span>{isEdit ? "Edit habit" : "Create habit"}</span>
        <IconButton onClick={onClose} size="small">
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <Stack component="form" onSubmit={handleSubmit} noValidate>
        <DialogContent dividers>
          <Stack spacing={2.5}>
            {formError && <Alert severity="error">{formError}</Alert>}

            <TextField
              label="Habit name"
              fullWidth
              autoFocus
              value={form.name}
              onChange={handleChange("name")}
              onBlur={handleBlur("name")}
              error={touched.name && !!errors.name}
              helperText={touched.name && errors.name}
              placeholder="E.g. Read for 20 minutes"
            />

            <TextField
              label="Description (optional)"
              fullWidth
              multiline
              minRows={2}
              value={form.description}
              onChange={handleChange("description")}
              placeholder="What does this habit involve?"
            />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Category"
                  fullWidth
                  value={form.category}
                  onChange={handleChange("category")}
                >
                  {CATEGORIES.map((c) => (
                    <MenuItem key={c} value={c}>
                      {c}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Frequency"
                  fullWidth
                  value={form.frequency}
                  onChange={handleChange("frequency")}
                >
                  {FREQUENCIES.map((f) => (
                    <MenuItem key={f} value={f}>
                      {f}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>

            <TextField select label="Priority" fullWidth value={form.priority} onChange={handleChange("priority")}>
              {PRIORITIES.map((p) => (
                <MenuItem key={p} value={p}>
                  {p}
                </MenuItem>
              ))}
            </TextField>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Start date"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={form.startDate}
                  onChange={handleChange("startDate")}
                  onBlur={handleBlur("startDate")}
                  error={touched.startDate && !!errors.startDate}
                  helperText={touched.startDate && errors.startDate}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="End date (optional)"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={form.endDate}
                  onChange={handleChange("endDate")}
                  onBlur={handleBlur("endDate")}
                  error={touched.endDate && !!errors.endDate}
                  helperText={touched.endDate && errors.endDate}
                />
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} color="inherit" disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={submitting}>
            {submitting ? "Saving..." : isEdit ? "Save changes" : "Create habit"}
          </Button>
        </DialogActions>
      </Stack>
    </Dialog>
  );
}
