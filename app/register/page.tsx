"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Typography from "@mui/material/Typography";
import AuthLayout from "@/components/AuthLayout";
import { useAuth } from "@/context/AuthContext";
import { registerSchema, zodErrors } from "@/lib/schemas";

const initialForm = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const errors = zodErrors(registerSchema, form);
  const isValid = Object.keys(errors).length === 0;

  const handleChange = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleBlur = (field: string) => () => setTouched((prev) => ({ ...prev, [field]: true }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, email: true, password: true, confirmPassword: true });
    setFormError("");
    if (!isValid) return;
    setSubmitting(true);
    try {
      await register(form);
      router.push("/dashboard");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Couldn't create the account.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Create your account" subtitle="Start building better habits today.">
      <Stack component="form" spacing={2.5} onSubmit={handleSubmit} noValidate>
        {formError && <Alert severity="error">{formError}</Alert>}

        <TextField
          label="Full name"
          fullWidth
          value={form.name}
          onChange={handleChange("name")}
          onBlur={handleBlur("name")}
          error={touched.name && !!errors.name}
          helperText={touched.name && errors.name}
          autoComplete="name"
        />

        <TextField
          label="Email"
          type="email"
          fullWidth
          value={form.email}
          onChange={handleChange("email")}
          onBlur={handleBlur("email")}
          error={touched.email && !!errors.email}
          helperText={touched.email && errors.email}
          autoComplete="email"
        />

        <TextField
          label="Password"
          type="password"
          fullWidth
          value={form.password}
          onChange={handleChange("password")}
          onBlur={handleBlur("password")}
          error={touched.password && !!errors.password}
          helperText={(touched.password && errors.password) || "At least 6 characters."}
          autoComplete="new-password"
        />

        <TextField
          label="Confirm password"
          type="password"
          fullWidth
          value={form.confirmPassword}
          onChange={handleChange("confirmPassword")}
          onBlur={handleBlur("confirmPassword")}
          error={touched.confirmPassword && !!errors.confirmPassword}
          helperText={touched.confirmPassword && errors.confirmPassword}
          autoComplete="new-password"
        />

        <Button type="submit" variant="contained" size="large" disabled={submitting}>
          {submitting ? "Creating account..." : "Create account"}
        </Button>

        <Typography variant="body2" color="text.secondary" textAlign="center">
          Already have an account?{" "}
          <Link href="/login" style={{ color: "inherit", fontWeight: 600 }}>
            Sign in
          </Link>
        </Typography>
      </Stack>
    </AuthLayout>
  );
}
