'use client';

import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded';
import { PASSWORD_RULES, passwordScore, STRENGTH_LABELS } from '@/lib/password';

const SCORE_COLORS = [
  'error',
  'error',
  'warning',
  'primary',
  'success',
] as const;

export default function PasswordStrength({ password }: { password: string }) {
  const allOk = PASSWORD_RULES.every((r) => r.test(password));
  const score = allOk
    ? passwordScore(password)
    : Math.min(passwordScore(password), 2);

  return (
    <Box aria-live="polite">
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
        <LinearProgress
          variant="determinate"
          value={password ? ((score + 1) / 5) * 100 : 0}
          color={SCORE_COLORS[score]}
          aria-label="Password strength"
          sx={{ flex: 1, height: 6, borderRadius: 3 }}
        />
        <Typography
          variant="caption"
          fontWeight={700}
          color={password ? `${SCORE_COLORS[score]}.main` : 'text.secondary'}
          sx={{ minWidth: 64, textAlign: 'right' }}
        >
          {password ? STRENGTH_LABELS[score] : ''}
        </Typography>
      </Stack>
      <Box
        component="ul"
        sx={{
          m: 0,
          p: 0,
          listStyle: 'none',
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          columnGap: 2,
          rowGap: 0.5,
        }}
      >
        {PASSWORD_RULES.map((rule) => {
          const ok = rule.test(password);
          return (
            <Stack
              key={rule.label}
              component="li"
              direction="row"
              spacing={0.75}
              alignItems="center"
              sx={{ color: ok ? 'success.main' : 'text.secondary' }}
            >
              {ok ? (
                <CheckCircleRoundedIcon sx={{ fontSize: 16 }} />
              ) : (
                <RadioButtonUncheckedRoundedIcon sx={{ fontSize: 16 }} />
              )}
              <Typography variant="caption" color="inherit">
                {rule.label}
              </Typography>
            </Stack>
          );
        })}
      </Box>
    </Box>
  );
}
