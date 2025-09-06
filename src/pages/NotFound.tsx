import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const NotFound: React.FC = () => {
  const navigate = useNavigate();
  return (
    <Box sx={{ textAlign: 'center', py: 6 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        404 — הדף לא נמצא
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        הדף שחיפשת אינו קיים.
      </Typography>
      <Button variant="contained" onClick={() => navigate('/')}>חזרה לבית</Button>
    </Box>
  );
};

export default NotFound;


