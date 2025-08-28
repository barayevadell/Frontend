// src/pages/Home.tsx
import { Box, Button, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        דף הבית
      </Typography>

      <Stack direction="row" spacing={2}>
        {/* כפתור שמעביר למסך הסטודנטים */}
        <Button variant="contained" onClick={() => navigate("/students")}>
          לרשימת הסטודנטים
        </Button>
      </Stack>
    </Box>
  );
}
