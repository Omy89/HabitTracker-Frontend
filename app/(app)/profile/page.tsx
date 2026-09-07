"use client";

import { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import ChecklistRoundedIcon from "@mui/icons-material/ChecklistRounded";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import { useAuth } from "@/context/AuthContext";
import { useHabits } from "@/context/HabitsContext";
import * as api from "@/lib/api";
import StatCard from "@/components/StatCard";
import { accountSchema, passwordChangeSchema, zodErrors } from "@/lib/schemas";

function initials(name = ""): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");
}

interface SnackbarState {
  severity: "success" | "error";
  message: string;
}

const emptyPasswordForm = { currentPassword: "", newPassword: "", confirmPassword: "" };

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const { habits } = useHabits();
  const [accountForm, setAccountForm] = useState({ name: "", email: "" });
  const [accountTouched, setAccountTouched] = useState<Record<string, boolean>>({});
  const [savingAccount, setSavingAccount] = useState(false);

  const [passwordForm, setPasswordForm] = useState(emptyPasswordForm);
  const [passwordTouched, setPasswordTouched] = useState<Record<string, boolean>>({});
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const [snackbar, setSnackbar] = useState<SnackbarState | null>(null);

  useEffect(() => {
    if (user) {
      setAccountForm({ name: user.name, email: user.email });
    }
  }, [user]);

  const bestStreak = habits.reduce((max, h) => Math.max(max, h.bestStreak || 0), 0);

  const accountErrors = zodErrors(accountSchema, accountForm);
  const accountValid = Object.keys(accountErrors).length === 0;

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setAccountTouched({ name: true, email: true });
    if (!accountValid || !user) return;
    setSavingAccount(true);
    try {
      await api.updateProfile(user.id, accountForm);
      refreshUser(accountForm);
      setSnackbar({ severity: "success", message: "Profile updated." });
    } catch (err) {
      setSnackbar({ severity: "error", message: err instanceof Error ? err.message : "Couldn't update profile." });
    } finally {
      setSavingAccount(false);
    }
  };

  const passwordErrors = zodErrors(passwordChangeSchema, passwordForm);
  const passwordValid = Object.keys(passwordErrors).length === 0;

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordTouched({ currentPassword: true, newPassword: true, confirmPassword: true });
    setPasswordError("");
    if (!passwordValid || !user) return;
    setSavingPassword(true);
    try {
      await api.changePassword(user.id, passwordForm);
      setPasswordForm(emptyPasswordForm);
      setPasswordTouched({});
      setSnackbar({ severity: "success", message: "Password updated." });
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : "Couldn't update password.");
    } finally {
      setSavingPassword(false);
    }
  };

  if (!user) return null;

  return (
    <Grid container spacing={2.5}>
      <Grid item xs={12} md={4}>
        <Card elevation={0}>
          <CardContent sx={{ textAlign: "center", py: 4 }}>
            <Avatar
              sx={{
                width: 76,
                height: 76,
                mx: "auto",
                mb: 2,
                bgcolor: "primary.main",
                fontSize: 28,
                fontWeight: 700,
              }}
            >
              {initials(user.name)}
            </Avatar>
            <Typography variant="h6" fontWeight={700}>
              {user.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {user.email}
            </Typography>

            <Stack spacing={1.5}>
              <StatCard icon={ChecklistRoundedIcon} label="Habits created" value={habits.length} />
              <StatCard
                icon={EmojiEventsRoundedIcon}
                label="Best streak ever"
                value={`${bestStreak} day${bestStreak === 1 ? "" : "s"}`}
                accent="secondary"
              />
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={8}>
        <Stack spacing={2.5}>
          <Card elevation={0}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                Account details
              </Typography>
              <Stack component="form" spacing={2.5} onSubmit={handleSaveAccount} noValidate>
                <TextField
                  label="Full name"
                  fullWidth
                  value={accountForm.name}
                  onChange={(e) => setAccountForm((p) => ({ ...p, name: e.target.value }))}
                  onBlur={() => setAccountTouched((p) => ({ ...p, name: true }))}
                  error={accountTouched.name && !!accountErrors.name}
                  helperText={accountTouched.name && accountErrors.name}
                />
                <TextField
                  label="Email"
                  type="email"
                  fullWidth
                  value={accountForm.email}
                  onChange={(e) => setAccountForm((p) => ({ ...p, email: e.target.value }))}
                  onBlur={() => setAccountTouched((p) => ({ ...p, email: true }))}
                  error={accountTouched.email && !!accountErrors.email}
                  helperText={accountTouched.email && accountErrors.email}
                />
                <Button
                  type="submit"
                  variant="contained"
                  sx={{ alignSelf: "flex-start" }}
                  disabled={savingAccount}
                >
                  {savingAccount ? "Saving..." : "Save changes"}
                </Button>
              </Stack>
            </CardContent>
          </Card>

          <Card elevation={0}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                Change password
              </Typography>
              <Stack component="form" spacing={2.5} onSubmit={handleSavePassword} noValidate>
                {passwordError && <Alert severity="error">{passwordError}</Alert>}
                <TextField
                  label="Current password"
                  type="password"
                  fullWidth
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))
                  }
                  onBlur={() => setPasswordTouched((p) => ({ ...p, currentPassword: true }))}
                  error={passwordTouched.currentPassword && !!passwordErrors.currentPassword}
                  helperText={passwordTouched.currentPassword && passwordErrors.currentPassword}
                />
                <Divider />
                <TextField
                  label="New password"
                  type="password"
                  fullWidth
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
                  onBlur={() => setPasswordTouched((p) => ({ ...p, newPassword: true }))}
                  error={passwordTouched.newPassword && !!passwordErrors.newPassword}
                  helperText={
                    (passwordTouched.newPassword && passwordErrors.newPassword) ||
                    "At least 6 characters."
                  }
                />
                <TextField
                  label="Confirm new password"
                  type="password"
                  fullWidth
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))
                  }
                  onBlur={() => setPasswordTouched((p) => ({ ...p, confirmPassword: true }))}
                  error={passwordTouched.confirmPassword && !!passwordErrors.confirmPassword}
                  helperText={passwordTouched.confirmPassword && passwordErrors.confirmPassword}
                />
                <Button
                  type="submit"
                  variant="contained"
                  sx={{ alignSelf: "flex-start" }}
                  disabled={savingPassword}
                >
                  {savingPassword ? "Updating..." : "Update password"}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Grid>

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
    </Grid>
  );
}
