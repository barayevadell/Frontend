import React from 'react';
import { Paper, Typography, Box } from '@mui/material';

type EmptyStateProps = {
  title: string;
  description?: string;
};

const EmptyState: React.FC<EmptyStateProps> = ({ title, description }) => {
  return (
    <Paper sx={{ p: 4, textAlign: 'center' }}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        {title}
      </Typography>
      {description ? <Typography color="text.secondary">{description}</Typography> : null}
      <Box sx={{ mt: 1 }} />
    </Paper>
  );
};

export default EmptyState;


