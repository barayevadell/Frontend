// src/pages/StatisticsPage.tsx
import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
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

import { readAll } from '@lib/storage';
import { ENTITIES } from '@config/entities';

type Sender = 'מנהל' | 'סטודנט';

type ConversationMessage = {
  sender: Sender;
  text?: string;
  // can be Date.now() number OR ISO string:
  timestamp?: number | string;
};

type RequestStatus = 'פתוחה' | 'בטיפול' | 'נסגרה';

type RequestItem = {
  status?: RequestStatus | string;
  conversation?: ConversationMessage[];
  createdAt?: string; // ISO
  updatedAt?: string; // ISO
  subject?: string;
};

const normalizeStatus = (raw: unknown): RequestStatus => {
  const s = String(raw ?? '').trim().toLowerCase();
  if (s === 'נסגרה' || s === 'closed') return 'נסגרה';
  if (s === 'בטיפול' || s === 'in_progress' || s === 'processing') return 'בטיפול';
  return 'פתוחה';
};

// timestamp can be ISO string or number (ms)
const toMs = (t?: number | string): number | null => {
  if (t == null) return null;
  if (typeof t === 'number' && Number.isFinite(t)) return t;
  const ms = Date.parse(String(t));
  return Number.isFinite(ms) ? ms : null;
};

const REQUESTS_KEY = ENTITIES.find((e) => e.key === 'requests')?.key ?? 'requests';

const StatisticsPage: React.FC = () => {
  const [isLoggedIn] = React.useState(() => {
    try {
      const raw = localStorage.getItem('blue-admin:user');
      return !!(raw && JSON.parse(raw));
    } catch {
      return false;
    }
  });

  const [rows, setRows] = React.useState<RequestItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  // async load so it works with Firestore-backed readAll
  React.useEffect(() => {
    const load = async () => {
      try {
        const data = await Promise.resolve(readAll(REQUESTS_KEY));
        setRows(Array.isArray(data) ? (data as RequestItem[]) : []);
      } catch (err) {
        if ((import.meta as any).env?.DEV) {
          console.error('[STATISTICS] Failed to read storage', err);
        }
        setRows([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

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

  // stats
  const total = rows.length;
  const open = rows.filter((r) => {
    const st = normalizeStatus(r.status);
    return st === 'פתוחה' || st === 'בטיפול';
  }).length;
  const closed = rows.filter((r) => normalizeStatus(r.status) === 'נסגרה').length;

  // average first response time by manager
  const avgResponseTime = React.useMemo(() => {
    if (rows.length === 0) return 'N/A';

    let totalMs = 0;
    let count = 0;

    for (const r of rows) {
      if (!r.createdAt || !Array.isArray(r.conversation)) continue;
      const createdMs = toMs(r.createdAt);
      if (createdMs == null) continue;

      const firstManager = r.conversation
        .filter((m) => m?.sender === 'מנהל' && m.timestamp != null)
        .map((m) => toMs(m.timestamp))
        .filter((ms): ms is number => ms != null && ms > createdMs)
        .sort((a, b) => a - b)[0];

      if (firstManager != null) {
        totalMs += firstManager - createdMs;
        count += 1;
      }
    }

    if (count === 0) return 'N/A';
    const avg = totalMs / count;
    const minutes = Math.round(avg / (1000 * 60));
    if (minutes < 60) return `${minutes} דקות`;
    const hours = Math.round(avg / (1000 * 60 * 60));
    if (hours < 24) return `${hours} שעות`;
    const days = Math.round(hours / 24);
    return `${days} ימים`;
  }, [rows]);

  // simple chart data
  const chartData = [
    { name: 'פתוחות/בטיפול', value: open, color: '#1976d2' },
    { name: 'נסגרו', value: closed, color: '#d32f2f' },
  ];

  return (
    <Box dir="rtl">
      <Typography variant="h4" sx={{ mb: 3, textAlign: 'right' }}>
        סטטיסטיקה
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                סה״כ פניות
              </Typography>
              <Typography variant="h4">{loading ? '—' : total}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                פתוחות/בטיפול
              </Typography>
              <Typography variant="h4" color="primary">
                {loading ? '—' : open}
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
                {loading ? '—' : closed}
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
              <Typography variant="h6">{loading ? '—' : avgResponseTime}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, textAlign: 'right' }}>
          התפלגות פניות
        </Typography>
        <Box sx={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={loading ? [] : chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {(loading ? [] : chartData).map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
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
