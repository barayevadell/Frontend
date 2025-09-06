// src/pages/StatisticsPage.tsx
import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  useTheme,
  Button,            // ← כפתור להתחברות
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
} from 'recharts';

import { readAll } from '../lib/storage';
import { ENTITIES } from '@config/entities';

// טיפוסים בסיסיים
type Sender = 'מנהל' | 'סטודנט';
type ConversationMessage = {
  sender: Sender;
  text?: string;
  timestamp?: string; // ISO
};
type RequestStatus = 'פתוחה' | 'בטיפול' | 'נסגרה';
type RequestItem = {
  status?: RequestStatus | string;
  conversation?: ConversationMessage[];
  createdAt?: string; // ISO
};

// נרמול סטטוס
const normalizeStatus = (raw: unknown): RequestStatus => {
  const s = String(raw ?? '').trim().toLowerCase();
  if (s === 'נסגרה' || s === 'closed') return 'נסגרה';
  if (s === 'בטיפול' || s === 'in_progress' || s === 'processing') return 'בטיפול';
  return 'פתוחה';
};

// אותו KEY כמו בסידינג
const REQUESTS_KEY = ENTITIES.find((e) => e.key === 'requests')?.key ?? 'requests';

const StatisticsPage: React.FC = () => {
  const theme = useTheme();

  // בדיקת התחברות
  const isLoggedIn = React.useMemo(() => {
    try {
      const raw = localStorage.getItem('blue-admin:user');
      return !!(raw && JSON.parse(raw));
    } catch {
      return false;
    }
  }, []);

  // אם לא מחובר – מציגים כרטיס עם כפתור התחברות
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

  // קריאת הנתונים מ-localStorage
  const allRequests = React.useMemo<RequestItem[]>(() => {
    try {
      const data = readAll(REQUESTS_KEY) || [];
      return Array.isArray(data) ? (data as RequestItem[]) : [];
    } catch (err) {
      if ((import.meta as any).env?.DEV) {
        // eslint-disable-next-line no-console
        console.error('[STATISTICS] Failed to read storage', err);
      }
      return [];
    }
  }, []);

  // חישוב הסטטיסטיקות
  const statistics = React.useMemo(() => {
    const rows = allRequests.filter((r) => r && typeof r === 'object');

    const total = rows.length;
    const open = rows.filter((r) => {
      const st = normalizeStatus(r.status);
      return st === 'פתוחה' || st === 'בטיפול';
    }).length;
    const closed = rows.filter((r) => normalizeStatus(r.status) === 'נסגרה').length;

    const calcAvgResponse = () => {
      const withReplies = rows.filter((r) => {
        if (!r?.createdAt || !Array.isArray(r.conversation)) return false;
        return r.conversation.some((m) => m?.sender === 'מנהל' && m.timestamp);
      });
      if (withReplies.length === 0) return 'N/A';

      let totalMs = 0;
      let count = 0;

      withReplies.forEach((req) => {
        try {
          const created = new Date(req.createdAt as string).getTime();
          if (!Number.isFinite(created)) return;

          const firstManagerMs = (req.conversation || [])
            .filter((m) => m?.sender === 'מנהל' && m.timestamp)
            .map((m) => new Date(m.timestamp as string).getTime())
            .filter((t) => Number.isFinite(t) && t > created)
            .sort((a, b) => a - b)[0];

          if (Number.isFinite(firstManagerMs)) {
            totalMs += firstManagerMs - created;
            count += 1;
          }
        } catch {
          /* ignore bad item */
        }
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

    return {
      total,
      open,
      closed,
      avgResponseTime: calcAvgResponse(),
    };
  }, [allRequests]);

  // נתונים לגרף
  const chartData = React.useMemo(
    () => [
      { name: 'פתוחות', value: statistics.open, color: theme.palette.primary.main },
      { name: 'נסגרות', value: statistics.closed, color: theme.palette.error.main },
    ],
    [statistics.open, statistics.closed, theme]
  );

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, textAlign: 'right' }}>
        סטטיסטיקה
      </Typography>

      {/* קלפי סיכום */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                סה״כ פניות
              </Typography>
              <Typography variant="h4">{statistics.total}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                פתוחות
              </Typography>
              <Typography variant="h4" color="primary">
                {statistics.open}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                נסגרו
              </Typography>
              <Typography variant="h4" color="error">
                {statistics.closed}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                זמן תגובה ממוצע
              </Typography>
              <Typography variant="h6">{statistics.avgResponseTime}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* גרף */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, textAlign: 'right' }}>
          התפלגות פניות
        </Typography>
        <Box sx={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 14 }}
                axisLine={{ stroke: theme.palette.text.secondary }}
                tickLine={{ stroke: theme.palette.text.secondary }}
              />
              <YAxis
                tick={{ fontSize: 14, dx: -15 }}
                allowDecimals={false}
                axisLine={{ stroke: theme.palette.text.secondary }}
                tickLine={{ stroke: theme.palette.text.secondary }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: theme.shape.borderRadius,
                }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Paper>
    </Box>
  );
};

export default StatisticsPage;
