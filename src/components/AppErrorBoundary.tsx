import React from 'react';
import { Box, Typography, Button, Paper, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

class AppErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ERROR BOUNDARY]', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}

const ErrorFallback: React.FC<{ error?: Error }> = ({ error }) => {
  const navigate = useNavigate();

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleGoToLogin = () => {
    navigate('/');
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold' }}>
          אירעה שגיאה
        </Typography>

        <Typography variant="body1" sx={{ mb: 4, textAlign: 'right' }}>
          אנא רעננו את הדף או חזרו למסך ההתחברות
        </Typography>

        {import.meta.env.DEV && error && (
          <Box sx={{ mb: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1, textAlign: 'left' }}>
            <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
              {error.message}
            </Typography>
          </Box>
        )}

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button variant="contained" onClick={handleRefresh} sx={{ px: 3 }}>
            רענון
          </Button>
          <Button variant="outlined" onClick={handleGoToLogin} sx={{ px: 3 }}>
            מסך התחברות
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default AppErrorBoundary;
