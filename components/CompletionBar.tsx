"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Slider from "@mui/material/Slider";
import Typography from "@mui/material/Typography";

interface CompletionBarProps {
  value: number;
  onCommit: (value: number) => void;
  disabled?: boolean;
}

/** An editable, click-and-drag bar for today's completion percentage. */
export default function CompletionBar({ value, onCommit, disabled }: CompletionBarProps) {
  const [dragValue, setDragValue] = useState<number | null>(null);
  const shown = dragValue ?? value;

  const color = shown >= 100 ? "success" : shown >= 40 ? "warning" : "primary";

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 160 }}>
      <Slider
        aria-label="Today's progress"
        value={shown}
        onChange={(_, v) => setDragValue(v as number)}
        onChangeCommitted={(_, v) => {
          setDragValue(null);
          onCommit(v as number);
        }}
        step={5}
        min={0}
        max={100}
        color={color}
        disabled={disabled}
        sx={{
          height: 10,
          "& .MuiSlider-thumb": {
            width: 20,
            height: 20,
            boxShadow: "0 1px 4px rgba(17,24,39,0.25)",
          },
          "& .MuiSlider-rail": {
            opacity: 0.3,
          },
          "& .MuiSlider-track": {
            border: "none",
          },
        }}
      />
      <Typography variant="body2" fontWeight={700} sx={{ minWidth: 40, textAlign: "right" }}>
        {shown}%
      </Typography>
    </Box>
  );
}
