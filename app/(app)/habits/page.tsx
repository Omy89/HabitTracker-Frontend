"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Fab from "@mui/material/Fab";
import Chip from "@mui/material/Chip";
import Switch from "@mui/material/Switch";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import InputAdornment from "@mui/material/InputAdornment";
import Paper from "@mui/material/Paper";
import Skeleton from "@mui/material/Skeleton";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Tooltip from "@mui/material/Tooltip";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import LocalFireDepartmentRoundedIcon from "@mui/icons-material/LocalFireDepartmentRounded";
import ChecklistRoundedIcon from "@mui/icons-material/ChecklistRounded";
import HabitFormDialog from "@/components/HabitFormDialog";
import ConfirmDialog from "@/components/ConfirmDialog";
import EmptyState from "@/components/EmptyState";
import CompletionBar from "@/components/CompletionBar";
import { useHabits } from "@/context/HabitsContext";
import type { HabitFormValues, HabitWithProgress, Priority } from "@/lib/types";

const PRIORITY_COLOR: Record<Priority, "error" | "warning" | "default"> = {
  High: "error",
  Medium: "warning",
  Low: "default",
};

interface SnackbarState {
  severity: "success" | "error";
  message: string;
}

export default function HabitsPage() {
  const { habits, loading, createHabit, updateHabit, deleteHabit, toggleActive, setProgress } =
    useHabits();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<HabitWithProgress | null>(null);
  const [deletingHabit, setDeletingHabit] = useState<HabitWithProgress | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [snackbar, setSnackbar] = useState<SnackbarState | null>(null);

  useEffect(() => {
    if (searchParams.get("new") === "1") {
      setDialogOpen(true);
      router.replace("/habits");
    }
  }, [searchParams, router]);

  const categories = useMemo(
    () => ["All", ...new Set(habits.map((h) => h.category))],
    [habits]
  );

  const filtered = habits.filter((h) => {
    const matchesSearch = h.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "All" || h.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

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
      setSnackbar({ severity: "success", message: "Habit updated." });
    } else {
      await createHabit(data);
      setSnackbar({ severity: "success", message: "Habit created." });
    }
    setDialogOpen(false);
  };

  const handleDelete = async () => {
    if (!deletingHabit) return;
    setDeleting(true);
    try {
      await deleteHabit(deletingHabit.id);
      setSnackbar({ severity: "success", message: "Habit deleted." });
      setDeletingHabit(null);
    } catch (err) {
      setSnackbar({
        severity: "error",
        message: err instanceof Error ? err.message : "Couldn't delete the habit.",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box sx={{ pb: 10 }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems={{ sm: "center" }}
        justifyContent="space-between"
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h6" fontWeight={700}>
            Your habits
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Activate them, mark your progress, or edit them anytime.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5}>
          <TextField
            size="small"
            placeholder="Search habit..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            select
            size="small"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            sx={{ minWidth: 140 }}
          >
            {categories.map((c) => (
              <MenuItem key={c} value={c}>
                {c}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </Stack>

      {loading ? (
        <Stack spacing={2}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={104} />
          ))}
        </Stack>
      ) : habits.length === 0 ? (
        <EmptyState
          icon={ChecklistRoundedIcon}
          title="Create your first habit"
          description="Set a name, frequency and priority. You can edit or deactivate it anytime."
          actionLabel="Create habit"
          onAction={openCreate}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={SearchRoundedIcon}
          title="No results"
          description="No habit matches your search or filter."
        />
      ) : (
        <Stack spacing={2}>
          {filtered.map((h) => {
            const priorityColor = PRIORITY_COLOR[h.priority];
            const accentColor = priorityColor === "default" ? "grey.400" : `${priorityColor}.main`;
            return (
            <Paper
              key={h.id}
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                borderLeft: "5px solid",
                borderLeftColor: accentColor,
                opacity: h.active ? 1 : 0.55,
              }}
            >
              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={{ xs: 2, md: 3 }}
                alignItems={{ md: "center" }}
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                    <Typography variant="h6" fontWeight={700} noWrap>
                      {h.name}
                    </Typography>
                    <Chip size="small" label={h.priority} color={PRIORITY_COLOR[h.priority]} />
                  </Stack>
                  {h.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 1 }}>
                      {h.description}
                    </Typography>
                  )}
                  <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1 }}>
                    <Chip size="small" variant="outlined" label={h.category} />
                    <Chip size="small" variant="outlined" label={h.frequency} />
                    <Chip
                      size="small"
                      variant="outlined"
                      icon={<LocalFireDepartmentRoundedIcon fontSize="small" />}
                      label={`${h.streak} day${h.streak === 1 ? "" : "s"}`}
                    />
                  </Stack>
                </Box>

                <CompletionBar
                  value={h.todayProgress}
                  disabled={!h.active}
                  onCommit={(v) => setProgress(h.id, v)}
                />

                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Tooltip title={h.active ? "Deactivate" : "Activate"}>
                    <Switch checked={h.active} onChange={() => toggleActive(h.id)} size="small" />
                  </Tooltip>
                  <Tooltip title="Edit">
                    <IconButton onClick={() => openEdit(h)}>
                      <EditRoundedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton color="error" onClick={() => setDeletingHabit(h)}>
                      <DeleteOutlineRoundedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Stack>
            </Paper>
            );
          })}
        </Stack>
      )}

      <Fab
        color="primary"
        onClick={openCreate}
        sx={{ position: "fixed", bottom: 32, right: 32 }}
        aria-label="Create habit"
      >
        <AddRoundedIcon />
      </Fab>

      <HabitFormDialog
        open={dialogOpen}
        habit={editingHabit}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={!!deletingHabit}
        title="Delete habit"
        description={`Are you sure you want to delete "${deletingHabit?.name}"? This can't be undone and its history will be lost.`}
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setDeletingHabit(null)}
      />

      <Snackbar
        open={!!snackbar}
        autoHideDuration={3000}
        onClose={() => setSnackbar(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        {snackbar ? (
          <Alert severity={snackbar.severity} variant="filled" onClose={() => setSnackbar(null)}>
            {snackbar.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </Box>
  );
}
