'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import AuthLayout from '@/components/AuthLayout';
import PasswordStrength from '@/components/PasswordStrength';
import { useAuth } from '@/context/AuthContext';
import { registerSchema, zodErrors } from '@/lib/schemas';
import { getErrorMessage } from '@/lib/errors';
import { PASSWORD_MAX_LENGTH } from '@/lib/password';

const initialForm = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
};

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const errors = zodErrors(registerSchema, form);
  const isValid = Object.keys(errors).length === 0;
  const error = (field: string) =>
    touched[field] && errors[field] ? errors[field] : undefined;

  const handleChange =
    (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleBlur = (field: string) => () =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
    });
    setFormError('');
    if (!isValid) return;
    setSubmitting(true);
    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      router.push('/dashboard');
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const passwordAdornment = (
    <InputAdornment position="end">
      <IconButton
        onClick={() => setShowPassword((s) => !s)}
        edge="end"
        aria-label="Show or hide password"
      >
        {showPassword ? <VisibilityOff /> : <Visibility />}
      </IconButton>
    </InputAdornment>
  );

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start building better habits today."
    >
      <Stack component="form" spacing={2.5} onSubmit={handleSubmit} noValidate>
        {formError && <Alert severity="error">{formError}</Alert>}

        <TextField
          label="Full name"
          fullWidth
          value={form.name}
          onChange={handleChange('name')}
          onBlur={handleBlur('name')}
          error={!!error('name')}
          helperText={error('name')}
          autoComplete="name"
          inputProps={{ maxLength: 50 }}
        />

        <TextField
          label="Email"
          type="email"
          fullWidth
          value={form.email}
          onChange={handleChange('email')}
          onBlur={handleBlur('email')}
          error={!!error('email')}
          helperText={error('email')}
          autoComplete="email"
        />

        <Stack spacing={1.25}>
          <TextField
            label="Password"
            type={showPassword ? 'text' : 'password'}
            fullWidth
            value={form.password}
            onChange={handleChange('password')}
            onBlur={handleBlur('password')}
            error={!!error('password')}
            helperText={error('password')}
            autoComplete="new-password"
            inputProps={{ maxLength: PASSWORD_MAX_LENGTH }}
            InputProps={{ endAdornment: passwordAdornment }}
          />
          <PasswordStrength password={form.password} />
        </Stack>

        <TextField
          label="Confirm password"
          type={showPassword ? 'text' : 'password'}
          fullWidth
          value={form.confirmPassword}
          onChange={handleChange('confirmPassword')}
          onBlur={handleBlur('confirmPassword')}
          error={!!error('confirmPassword')}
          helperText={error('confirmPassword')}
          autoComplete="new-password"
          inputProps={{ maxLength: PASSWORD_MAX_LENGTH }}
        />

        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={submitting}
        >
          {submitting ? 'Creating account...' : 'Create account'}
        </Button>

        <Typography variant="body2" color="text.secondary" textAlign="center">
          Already have an account?{' '}
          <Link href="/login" style={{ color: 'inherit', fontWeight: 600 }}>
            Sign in
          </Link>
        </Typography>
      </Stack>
    </AuthLayout>
  );
}
