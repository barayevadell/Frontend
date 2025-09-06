import React from 'react';
import { Box, Typography } from '@mui/material';
// Fallback implementation for brandAlpha if module is missing
const brandAlpha = (alpha: number) => `rgba(0, 0, 0, ${alpha})`;

const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        mt: 4,
        py: 2,
        textAlign: 'center',
        backgroundColor: brandAlpha(0.06),
        borderTop: `1px solid ${brandAlpha(0.12)}`,
      }}
    >
      <Typography variant="body2">© 2025 כל הזכויות שמורות לאדל ואאליטה</Typography>
    </Box>
  );
};

export default Footer;


