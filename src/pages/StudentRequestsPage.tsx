// src/pages/student/StudentRequestsPage.tsx
import React, { useEffect, useContext } from 'react';
import {
  Box,
  Typography,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  TextField,
  Snackbar,
  Alert,
  InputAdornment,
} from '@mui/material';
import { Search } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// ✅ Firestore imports
import { db } from '../firebase';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { LoadingContext } from '../App';

const StudentRequestsPage: React.FC = () => {
  const { setLoading } = useContext(LoadingContext);
  const navigate = useNavigate();
  const [rows, setRows] = React.useState<any[]>([]);
  const [filteredRows, setFilteredRows] = React.useState<any[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [dialog, setDialog] = React.useState<{ open: boolean; row?: any }>({ open: false });
  const [showReply, setShowReply] = React.useState(false);
  const [replyText, setReplyText] = React.useState('');
  const [snackbar, setSnackbar] = React.useState<{ open: boolean; message: string }>({
    open: false,
    message: '',
  });

  // 🔒 Check login
  const isLoggedIn = React.useMemo(() => {
    try {
      const raw = localStorage.getItem('blue-admin:user');
      return !!(raw && JSON.parse(raw));
    } catch {
      return false;
    }
  }, []);

  if (!isLoggedIn) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', minHeight: '60vh', textAlign: 'right' }}>
        <Paper sx={{ p: 4, borderRadius: 3, width: '100%', maxWidth: 480 }}>
          <Typography variant="h5" sx={{ mb: 1, textAlign: 'center' }}>נדרש להתחבר</Typography>
          <Typography color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
            כדי לצפות בפניות שלך, יש להתחבר למערכת.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button variant="contained" href="/" sx={{ px: 4 }}>התחבר/י</Button>
          </Box>
        </Paper>
      </Box>
    );
  }

  // Validate student role
  let user: any = null;
  try {
    user = JSON.parse(localStorage.getItem('blue-admin:user') as string);
    if (user?.role !== 'student') {
      return (
        <Box sx={{ display: 'grid', placeItems: 'center', minHeight: '60vh', textAlign: 'right' }}>
          <Paper sx={{ p: 4, borderRadius: 3, width: '100%', maxWidth: 480 }}>
            <Typography variant="h5" sx={{ mb: 1, textAlign: 'center' }}>גישה מוגבלת</Typography>
            <Typography color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
              עמוד זה זמין לסטודנטים בלבד. התחבר/י כסטודנט.
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Button variant="contained" href="/" sx={{ px: 4 }}>התחבר/י</Button>
            </Box>
          </Paper>
        </Box>
      );
    }
  } catch {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', minHeight: '60vh', textAlign: 'right' }}>
        <Paper sx={{ p: 4, borderRadius: 3, width: '100%', maxWidth: 480 }}>
          <Typography variant="h5" sx={{ mb: 1, textAlign: 'center' }}>שגיאה בנתוני המשתמש</Typography>
          <Typography color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
            נסי להתחבר מחדש למערכת.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button variant="contained" href="/" sx={{ px: 4 }}>התחבר/י</Button>
          </Box>
        </Paper>
      </Box>
    );
  }

  // ✅ Load student's requests (real-time from Firestore)
  React.useEffect(() => {
    setLoading(true);
    const q = query(collection(db, 'requests'), where('idNumber', '==', user.idNumber));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setRows(data);
        setLoading(false);
      },
      (error) => {
        console.error('[STUDENT REQUESTS] Firestore listener error:', error);
        setRows([]);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [user?.idNumber, setLoading]);

  // Filter search results
  React.useEffect(() => {
    const safeRows = Array.isArray(rows) ? rows : [];
    if (!searchTerm.trim()) {
      setFilteredRows(safeRows);
      return;
    }
    const s = searchTerm.toLowerCase();
    setFilteredRows(
      safeRows.filter(
        (row) =>
          (row.subject || '').toLowerCase().includes(s) ||
          (row.details || '').toLowerCase().includes(s) ||
          (row.status || '').toLowerCase().includes(s)
      )
    );
  }, [rows, searchTerm]);

  return (
    <Box>
      <Box
        dir="rtl"
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}
      >
        <Typography variant="h4" sx={{ textAlign: 'right' }}>הפניות שלי</Typography>
        <Button variant="contained" onClick={() => navigate('/student/requests/new')}>
          פנייה חדשה
        </Button>
      </Box>

      <TextField
        fullWidth
        placeholder="חיפוש פניות..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 3 }}
      />

      {filteredRows.length === 0 ? (
        <Typography sx={{ textAlign: 'right' }}>אין פניות</Typography>
      ) : (
        <>
          <TableContainer component={Paper} aria-label="טבלת פניות שלי">
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: (t) => t.palette.primary.main }}>
                  <TableCell align="left" sx={{ color: '#111', fontWeight: 800 }}>הצגה</TableCell>
                  <TableCell align="right" sx={{ color: '#111', fontWeight: 800 }}>תאריך עדכון</TableCell>
                  <TableCell align="right" sx={{ color: '#111', fontWeight: 800 }}>סטטוס</TableCell>
                  <TableCell align="right" sx={{ color: '#111', fontWeight: 800 }}>נושא</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredRows.map((r, i) => (
                  <TableRow key={r.id || i} hover>
                    <TableCell align="left">
                      <Button
                        variant="contained"
                        size="small"
                        sx={{
                          backgroundColor: (t) => t.palette.primary.main + 'aa',
                          color: '#fff',
                          '&:hover': { backgroundColor: (t) => t.palette.primary.main + 'bb' },
                        }}
                        onClick={() => setDialog({ open: true, row: r })}
                      >
                        הצגה
                      </Button>
                    </TableCell>

                    <TableCell align="right">
                      {(() => {
                        try {
                          const date =
                            r.updatedAt?.toDate?.() ||
                            r.createdAt?.toDate?.() ||
                            new Date(r.updatedAt || r.createdAt);
                          return date ? new Date(date).toLocaleDateString('he-IL') : 'לא זמין';
                        } catch {
                          return 'לא זמין';
                        }
                      })()}
                    </TableCell>

                    <TableCell align="right">{r.status}</TableCell>
                    <TableCell align="right">{r.subject}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* 🔍 Request Details Dialog */}
          <Dialog
            open={dialog.open}
            onClose={() => {
              setDialog({ open: false });
              setShowReply(false);
              setReplyText('');
            }}
            fullWidth
            maxWidth="sm"
          >
            <DialogTitle>פרטי פנייה</DialogTitle>
            <DialogContent dividers>
              <Stack spacing={1} sx={{ textAlign: 'right' }}>
                <Typography><strong>נושא:</strong> {dialog.row?.subject}</Typography>
                <Typography><strong>סטטוס:</strong> {dialog.row?.status}</Typography>
                <Typography sx={{ mt: 1 }}><strong>תיאור:</strong> {dialog.row?.details}</Typography>

                {dialog.row?.attachments && dialog.row.attachments.length > 0 && (
                  <Box sx={{ mt: 2, p: 2, backgroundColor: (t) => t.palette.grey[100], borderRadius: 1 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>קבצים מצורפים:</Typography>
                    {dialog.row.attachments.map((attachment: any, idx: number) => (
                      <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="body2">
                          {attachment.name} ({(attachment.size / 1024).toFixed(1)} KB)
                        </Typography>
                        {attachment.dataURL && (
                          <Button size="small" variant="outlined" onClick={() => window.open(attachment.dataURL)}>
                            פתח
                          </Button>
                        )}
                      </Box>
                    ))}
                  </Box>
                )}

                <Typography variant="h6" sx={{ mt: 2 }}>התכתבות</Typography>
                <Stack spacing={1}>
                  {(dialog.row?.conversation || []).map((m: any, idx: number) => (
                    <Typography key={idx}><strong>{m.sender}:</strong> {m.text}</Typography>
                  ))}
                </Stack>
              </Stack>
            </DialogContent>

            <DialogActions sx={{ flexDirection: 'column', alignItems: 'stretch', gap: 1 }}>
              {dialog.row?.status !== 'נסגרה' ? (
                !showReply ? (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <Button onClick={() => setDialog({ open: false })}>סגור</Button>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button variant="contained" onClick={() => setShowReply(true)}>השב</Button>
                      <Button variant="outlined" onClick={() => navigate('/student/requests/new')}>
                        פנייה חדשה
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
                    <TextField
                      placeholder="כתבו תגובה"
                      fullWidth
                      size="small"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                    />
                    <Button
                      variant="contained"
                      disabled={!replyText.trim()}
                      onClick={async () => {
                        if (!dialog.row?.id) return;
                        const ref = doc(db, 'requests', dialog.row.id);
                        const updatedConversation = [
                          ...(dialog.row.conversation || []),
                          {
                            sender: 'סטודנט',
                            text: replyText.trim(),
                            timestamp: new Date().toISOString(),
                          },
                        ];
                        await updateDoc(ref, {
                          conversation: updatedConversation,
                          updatedAt: new Date().toISOString(),
                        });
                        setSnackbar({ open: true, message: 'ההודעה נשלחה' });
                        setReplyText('');
                        setShowReply(false);
                      }}
                    >
                      שלח
                    </Button>
                  </Box>
                )
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <Button onClick={() => setDialog({ open: false })}>סגור</Button>
                  <Button variant="contained" onClick={() => navigate('/student/requests/new')}>
                    פנייה חדשה
                  </Button>
                </Box>
              )}
            </DialogActions>
          </Dialog>
        </>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={2000}
        onClose={() => setSnackbar({ open: false, message: '' })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled" onClose={() => setSnackbar({ open: false, message: '' })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default StudentRequestsPage;
