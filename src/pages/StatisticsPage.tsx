import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  useTheme,
  Button,
  CircularProgress,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
} from 'recharts';
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';

// Types for requests and messages
type Sender = 'מנהל' | 'סטודנט';
type ConversationMessage = {
  sender: Sender;
  text?: string;
  timestamp?: string;
};
type RequestStatus = 'פתוחה' | 'בטיפול' | 'נסגרה';
type RequestItem = {
  id?: string;
  status?: RequestStatus | string;
  conversation?: ConversationMessage[];
  createdAt?: string;
};

// Normalize status field (for consistency)
const normalizeStatus = (raw: unknown): RequestStatus => {
  const s = String(raw ?? '').trim().toLowerCase();
  if (s === 'נסגרה' || s === 'closed') return 'נסגרה';
  if (s === 'בטיפול' || s === 'in_progress' || s === 'processing') return 'בטיפול';
  return 'פתוחה';
};

const StatisticsPage: React.FC = () => {
  const theme = useTheme();

  // Check if the user is logged in
  const isLoggedIn = React.useMemo(() => {
    try {
      const raw = localStorage.getItem('blue-admin:user');
      return !!(raw && JSON.parse(raw));
    } catch {
      return false;
    }
  }, []);

  // If not logged in → show login box
  if (!isLoggedIn) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', minHeight: '60vh', textAlign: 'right' }}>
        <Paper sx={{ p: 4, borderRadius: 3, width: '100%', maxWidth: 480 }}>
          <Typography variant="h5" sx={{ mb: 1, textAlign: 'center' }}>
            נדרש להתחבר
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
            כדי לצפות בסטטיסטיקה, יש להתחבר למערכת.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button variant="contained" href="/" sx={{ px: 4 }}>
              התחבר/י
            </Button>
          </Box>
        </Paper>
      </Box>
    );
  }

  // Firestore data state
  const [allRequests, setAllRequests] = React.useState<RequestItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Real-time listener for Firestore changes
  React.useEffect(() => {
    const colRef = collection(db, 'requests');
    const unsubscribe = onSnapshot(colRef, (snapshot) => {
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as RequestItem[];
      setAllRequests(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Calculate statistics
  const statistics = React.useMemo(() => {
    const rows = allRequests.filter((r) => r && typeof r === 'object');
    const total = rows.length;

    // Count open/in-progress and closed requests
    const open = rows.filter((r) => {
      const st = normalizeStatus(r.status);
      return st === 'פתוחה' || st === 'בטיפול';
    }).length;
    const closed = rows.filter((r) => normalizeStatus(r.status) === 'נסגרה').length;

    // Calculate average manager response time
    const calcAvgResponse = () => {
      const withReplies = rows.filter(
        (r) => r?.createdAt && Array.isArray(r.conversation) && r.conversation.some((m) => m?.sender === 'מנהל' && m.timestamp)
      );
      if (withReplies.length === 0) return 'N/A';
      let totalMs = 0;
      let count = 0;
      withReplies.forEach((req) => {
        try {
          const created = new Date(req.createdAt as string).getTime();
          const firstManagerMs = (req.conversation || [])
            .filter((m) => m?.sender === 'מנהל' && m.timestamp)
            .map((m) => new Date(m.timestamp as string).getTime())
            .filter((t) => Number.isFinite(t) && t > created)
            .sort((a, b) => a - b)[0];
          if (Number.isFinite(firstManagerMs)) {
            totalMs += firstManagerMs - created;
            count += 1;
          }
        } catch {}
      });
      if (count === 0) return 'N/A';
      const avgMs = totalMs / count;
      const minutes = Math.round(avgMs / (1000 * 60));
      if (minutes < 60) return `${minutes} דקות`;
      const hours = Math.round(avgMs / (1000 * 60 * 60));
      if (hours < 24) return `${hours} שעות`;
      const days = Math.round(hours / 24);
      return `${days} ימים`;
    };

    return { total, open, closed, avgResponseTime: calcAvgResponse() };
  }, [allRequests]);

  // Data for Bar and Pie charts
  const chartData = [
    { name: 'פתוחות / בטיפול', value: statistics.open, color: theme.palette.primary.main },
    { name: 'נסגרות', value: statistics.closed, color: theme.palette.error.main },
  ];

  const pieData = [
    { name: 'פתוחות / בטיפול', value: statistics.open },
    { name: 'נסגרות', value: statistics.closed },
  ];

  // Show loader until data is ready
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Render the page
  return (
    <Box>
      {/* Title */}
      <Typography variant="h4" sx={{ mb: 3, textAlign: 'right' }}>
        סטטיסטיקה
      </Typography>

      {/* Summary cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { title: 'סה״כ פניות', value: statistics.total },
          { title: 'פתוחות / בטיפול', value: statistics.open, color: 'primary' },
          { title: 'נסגרו', value: statistics.closed, color: 'error' },
          { title: 'זמן תגובה ממוצע', value: statistics.avgResponseTime },
        ].map((item, i) => (
          <Grid key={i} item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  {item.title}
                </Typography>
                <Typography variant="h4" color={item.color || 'text.primary'}>
                  {item.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts section - split 50/50 */}
      <Grid container spacing={3}>
        {/* Bar chart (left side) */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: 420 }}>
            <Typography variant="h6" sx={{ mb: 2, textAlign: 'right' }}>
              התפלגות פניות
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Pie chart (right side) */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: 420 }}>
            <Typography variant="h6" sx={{ mb: 2, textAlign: 'right' }}>
              יחס פניות (אחוזים)
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="58%" // ← move pie a bit to the right
                  cy="50%"
                  outerRadius={110}
                  dataKey="value"
                  label={({ name, percent }: { name: string; percent?: number }) =>
                    `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`
                  }
                  labelLine={true}
                >
                  <Cell fill={theme.palette.primary.main} />
                  <Cell fill={theme.palette.error.main} />
                </Pie>
                <Legend verticalAlign="top" align="center" /> {/* Legend on top */}
                <Tooltip
                  formatter={(value: number) => `${value} פניות`}
                  labelFormatter={(name) => `${name}`}
                />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StatisticsPage;
