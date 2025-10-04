import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEntityByKey } from '@config/entities';
// ❌ removed: readAll, writeAll, exists
import { generateEmailFromName } from '@lib/emailGenerator';
import {
  Box, Button, Typography, TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Stack, Divider, Snackbar, Alert,
  Card, CardContent, IconButton, InputAdornment
} from '@mui/material';
import { AttachFile, Delete, CloudUpload, Search } from '@mui/icons-material';
import EntityTable from '@components/EntityTable';
import { getCreatePath } from '@lib/routing';
import EmptyState from '@components/EmptyState';

// ✅ Firestore imports (NEW)
import { db } from '../../firebase';
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  where
} from 'firebase/firestore';

const EntityListPage: React.FC = () => {
  const { entityKey } = useParams();
  const navigate = useNavigate();
  const [rows, setRows] = React.useState<any[]>([]);
  const [filteredRows, setFilteredRows] = React.useState<any[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [dialog, setDialog] = React.useState<{ open: boolean; row?: any }>({ open: false });
  const [showReply, setShowReply] = React.useState(false);
  const [replyText, setReplyText] = React.useState('');
  const [replyFile, setReplyFile] = React.useState<File | null>(null);
  const [isDragOver, setIsDragOver] = React.useState(false);
  const [snackbar, setSnackbar] = React.useState<{ open: boolean; message: string }>({ open: false, message: '' });

  // For /admin/requests route, use 'requests' entity directly
  const entity = getEntityByKey(entityKey || 'requests');

  // --- File attach handlers (unchanged UI/logic) ---
  const handleFileSelect = (file: File) => {
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setSnackbar({ open: true, message: 'גודל הקובץ חייב להיות קטן מ-5MB' });
      return;
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain',
      'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (!allowedTypes.includes(file.type)) {
      setSnackbar({ open: true, message: 'סוג קובץ לא נתמך. אנא בחרו קובץ תמונה, PDF או מסמך Word' });
      return;
    }
    setReplyFile(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragOver(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragOver(false); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };
  const removeFile = () => setReplyFile(null);

  // === Firestore helpers (NEW) ===

  // Load all docs for the current entity from Firestore
  const loadFromFirestore = React.useCallback(async () => {
    if (!entity) return;
    try {
      const snap = await getDocs(collection(db, entity.key));
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setRows(data);
    } catch (err) {
      console.error('[ENTITY LIST] Failed to load data from Firestore:', err);
      setRows([]);
    }
  }, [entity]);

  // Patch a single document by Firestore doc id
  const patchDocById = async (docId: string, patch: Record<string, any>) => {
    if (!entity) return;
    const ref = doc(db, entity.key, docId);
    await updateDoc(ref, patch);
    // Reflect changes locally to avoid reloading everything
    setRows(prev => prev.map(r => (r.id === docId ? { ...r, ...patch } : r)));
  };

  // If needed, find a document by a unique field (like idNumber) and update it
  // (kept for compatibility with your original logic based on idNumber)
  const patchDocByIdNumber = async (idNumber: string, patch: Record<string, any>) => {
    if (!entity) return;
    // Prefer to update by Firestore id when available in row objects
    // But when we only have idNumber (from legacy code), we query by that field.
    const q = query(collection(db, entity.key), where('idNumber', '==', idNumber));
    const snap = await getDocs(q);
    const batchUpdates: Array<Promise<void>> = [];
    snap.forEach(d => {
      batchUpdates.push(updateDoc(doc(db, entity.key, d.id), patch));
    });
    await Promise.all(batchUpdates);
    // Update local rows
    setRows(prev =>
      prev.map(r => (r.idNumber === idNumber ? { ...r, ...patch } : r))
    );
  };

  React.useEffect(() => {
    if (!entity) return;
    if ((import.meta as any).env?.DEV) {
      console.log('[ENTITY]', entityKey || 'requests');
    }
    loadFromFirestore();
  }, [entityKey, entity, loadFromFirestore]);

  // Filter rows based on search term (unchanged)
  React.useEffect(() => {
    const safeRows = Array.isArray(rows) ? rows : [];
    if (!searchTerm.trim()) {
      setFilteredRows(safeRows);
      return;
    }
    const filtered = safeRows.filter(row => {
      if (!row) return false;
      const searchLower = searchTerm.toLowerCase();
      return (
        (row.subject || '').toLowerCase().includes(searchLower) ||
        (row.details || '').toLowerCase().includes(searchLower) ||
        (row.status || '').toLowerCase().includes(searchLower) ||
        (row.name || '').toLowerCase().includes(searchLower) ||
        (row.email || '').toLowerCase().includes(searchLower) ||
        (row.idNumber || '').includes(searchTerm)
      );
    });
    setFilteredRows(filtered);
  }, [rows, searchTerm]);

  if (!entity) {
    return <Typography>ישות לא נמצאה.</Typography>;
  }

  // Auth guards (unchanged)
  const userStr = localStorage.getItem('blue-admin:user');
  if (!userStr) {
    if ((import.meta as any).env?.DEV) {
      console.log('[GUARD] admin blocked - not logged in');
    }
    return (
      <Box sx={{ textAlign: 'center', mt: 8 }}>
        <Typography variant="h5" sx={{ mb: 3 }}>
          יש להתחבר למערכת
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/')}
          sx={{ px: 4, py: 1.5 }}
        >
          התחבר/י
        </Button>
      </Box>
    );
  }

  try {
    const user = JSON.parse(userStr);
    if (user.role !== 'admin') {
      if ((import.meta as any).env?.DEV) {
        console.log('[GUARD] admin blocked - wrong role:', user.role);
      }
      return (
        <Box sx={{ textAlign: 'center', mt: 8 }}>
          <Typography variant="h5" sx={{ mb: 3 }}>
            גישה מוגבלת - מנהל בלבד
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/')}
            sx={{ px: 4, py: 1.5 }}
          >
            התחבר/י
          </Button>
        </Box>
      );
    }
    if ((import.meta as any).env?.DEV) {
      console.log('[GUARD] admin allowed');
    }
  } catch (error) {
    if ((import.meta as any).env?.DEV) {
      console.log('[GUARD] admin blocked - invalid user data');
    }
    return (
      <Box sx={{ textAlign: 'center', mt: 8 }}>
        <Typography variant="h5" sx={{ mb: 3 }}>
          שגיאה בנתוני המשתמש
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/')}
          sx={{ px: 4, py: 1.5 }}
        >
          התחבר/י
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" sx={{ flex: 1, textAlign: 'right' }}>
          פניות
        </Typography>
        {/* (kept any actions you might add later) */}
      </Box>

      {/* Search Bar (unchanged) */}
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
        <EmptyState title="אין רשומות" description="אין נתונים זמינים לתצוגה." />
      ) : (
        <>
          {/* Custom table for requests (kept your structure) */}
          {entity.key === 'requests' ? (
            <>
              <TableContainer component={Paper} aria-label="טבלת פניות">
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: (t) => t.palette.primary.main }}>
                      {['מספר זהות', 'שם', 'מייל', 'תפקיד', 'נושא', 'סטטוס', 'הצגה'].map((h) => (
                        <TableCell key={h} align="right" sx={{ color: '#111', fontWeight: 800 }}>
                          {h}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredRows.map((r, i) => (
                      <TableRow key={i} hover>
                        <TableCell align="right">{r.idNumber}</TableCell>
                        <TableCell align="right">{r.name}</TableCell>
                        <TableCell align="right">{r.name ? generateEmailFromName(r.name) : r.email}</TableCell>
                        <TableCell align="right">{r.role}</TableCell>
                        <TableCell align="right">{r.subject}</TableCell>
                        <TableCell align="right">{r.status}</TableCell>
                        <TableCell align="right">
                          <Button
                            variant="contained"
                            size="small"
                            sx={{
                              backgroundColor: (t) => t.palette.primary.main + 'aa',
                              color: '#fff',
                              '&:hover': { backgroundColor: (t) => t.palette.primary.main + 'bb' },
                            }}
                            onClick={async () => {
                              console.log('[OPEN DETAILS]', r.idNumber, 'status ->', r.status);
                              // ✅ On open: if status is "פתוחה" change to "בטיפול" in Firestore
                              if (r.status === 'פתוחה') {
                                // Prefer using Firestore document id if present
                                if (r.id) {
                                  await patchDocById(r.id, { status: 'בטיפול' });
                                  r.status = 'בטיפול';
                                } else if (r.idNumber) {
                                  await patchDocByIdNumber(r.idNumber, { status: 'בטיפול' });
                                  r.status = 'בטיפול';
                                }
                              }
                              setDialog({ open: true, row: r });
                              setShowReply(false);
                              setReplyText('');
                            }}
                          >
                            הצגה
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Details Dialog (kept UI, swapped data writes to Firestore) */}
              <Dialog
                open={dialog.open}
                onClose={() => { setDialog({ open: false }); setShowReply(false); setReplyText(''); }}
                fullWidth
                maxWidth="sm"
              >
                <DialogTitle>פרטי פנייה</DialogTitle>
                <DialogContent dividers>
                  <Stack spacing={1} sx={{ textAlign: 'right' }}>
                    <Typography><strong>שם:</strong> {dialog.row?.name}</Typography>
                    <Typography><strong>מספר זהות:</strong> {dialog.row?.idNumber}</Typography>
                    <Typography><strong>מייל:</strong> {dialog.row?.name ? generateEmailFromName(dialog.row.name) : dialog.row?.email}</Typography>
                    <Typography><strong>תפקיד:</strong> {dialog.row?.role}</Typography>
                    <Typography><strong>נושא:</strong> {dialog.row?.subject}</Typography>
                    <Typography><strong>סטטוס:</strong> {dialog.row?.status}</Typography>
                    <Typography sx={{ mt: 1 }}><strong>תיאור:</strong> {dialog.row?.details}</Typography>

                    {/* Attachments (kept visual) */}
                    {dialog.row?.attachments && dialog.row.attachments.length > 0 && (
                      <Box sx={{ mt: 2, p: 2, backgroundColor: (t) => t.palette.grey[100], borderRadius: 1 }}>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>קבצים מצורפים:</Typography>
                        {dialog.row.attachments.map((attachment: any, idx: number) => (
                          <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Typography variant="body2">{attachment.name} ({(attachment.size / 1024).toFixed(1)} KB)</Typography>
                            {attachment.dataURL && (
                              <Button size="small" variant="outlined" onClick={() => window.open(attachment.dataURL)}>
                                פתח
                              </Button>
                            )}
                          </Box>
                        ))}
                      </Box>
                    )}

                    <Divider sx={{ my: 1 }} />
                    <Typography variant="h6">התכתבות</Typography>
                    <Stack spacing={1}>
                      {(dialog.row?.conversation || []).map((m: any, idx: number) => (
                        <Box key={idx} sx={{ p: 1, backgroundColor: m.sender === 'מנהל' ? '#e3f2fd' : '#f5f5f5', borderRadius: 1 }}>
                          <Typography>
                            <strong>{m.sender}:</strong> {m.text}
                          </Typography>
                          {m.attachment && (
                            <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                              <AttachFile fontSize="small" />
                              <Typography variant="body2">
                                {m.attachment.name} ({(m.attachment.size / 1024).toFixed(1)} KB)
                              </Typography>
                              {m.attachment.dataURL && (
                                <Button size="small" variant="outlined" onClick={() => window.open(m.attachment.dataURL)}>
                                  פתח
                                </Button>
                              )}
                            </Box>
                          )}
                        </Box>
                      ))}
                    </Stack>
                  </Stack>
                </DialogContent>

                <DialogActions sx={{ flexDirection: 'column', alignItems: 'stretch', gap: 1 }}>
                  {dialog.row?.status !== 'נסגרה' ? (
                    <>
                      {!showReply ? (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                          <Button onClick={() => setDialog({ open: false })}>סגור</Button>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button variant="contained" onClick={() => setShowReply(true)}>השב</Button>
                            <Button
                              variant="outlined"
                              color="error"
                              onClick={async () => {
                                if (!dialog.row) return;
                                // ✅ Update status to "נסגרה" in Firestore
                                if (dialog.row.id) {
                                  await patchDocById(dialog.row.id, { status: 'נסגרה' });
                                } else if (dialog.row.idNumber) {
                                  await patchDocByIdNumber(dialog.row.idNumber, { status: 'נסגרה' });
                                }
                                setDialog({ open: false });
                                setSnackbar({ open: true, message: 'הפנייה נסגרה' });
                              }}
                            >
                              סגירת פנייה
                            </Button>
                          </Box>
                        </Box>
                      ) : (
                        <Stack spacing={2}>
                          <TextField
                            placeholder="כתבו תגובה"
                            fullWidth
                            multiline
                            rows={3}
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                          />

                          {/* File Attachment Section (visual kept; we only store metadata as before) */}
                          <Box>
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                              צירוף קובץ (אופציונלי)
                            </Typography>

                            {/* Drag & Drop Area */}
                            <Card
                              sx={{
                                border: isDragOver ? '2px dashed #1976d2' : '2px dashed #ccc',
                                backgroundColor: isDragOver ? '#f5f5f5' : 'transparent',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                '&:hover': { backgroundColor: '#f5f5f5', borderColor: '#1976d2' }
                              }}
                              onDragOver={handleDragOver}
                              onDragLeave={handleDragLeave}
                              onDrop={handleDrop}
                              onClick={() => document.getElementById('admin-file-input')?.click()}
                            >
                              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                                <CloudUpload sx={{ fontSize: 32, color: '#666', mb: 1 }} />
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                  גררו קובץ לכאן או לחצו לצירוף
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  תמיכה בקבצים: תמונות, PDF, Word (עד 5MB)
                                </Typography>
                              </CardContent>
                            </Card>

                            {/* Hidden file input */}
                            <input
                              id="admin-file-input"
                              type="file"
                              style={{ display: 'none' }}
                              onChange={handleFileInputChange}
                              accept="image/*,.pdf,.doc,.docx,.txt"
                            />

                            {/* Selected file preview */}
                            {replyFile && (
                              <Box sx={{
                                mt: 1, p: 1, backgroundColor: '#f5f5f5', borderRadius: 1,
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                              }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <AttachFile />
                                  <Typography variant="body2">
                                    {replyFile.name} ({(replyFile.size / 1024).toFixed(1)} KB)
                                  </Typography>
                                </Box>
                                <IconButton size="small" onClick={removeFile} color="error">
                                  <Delete />
                                </IconButton>
                              </Box>
                            )}
                          </Box>

                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                            <Button
                              variant="outlined"
                              onClick={() => {
                                setShowReply(false);
                                setReplyText('');
                                setReplyFile(null);
                              }}
                            >
                              ביטול
                            </Button>
                            <Button
                              variant="contained"
                              disabled={!replyText.trim()}
                              onClick={async () => {
                                if (!dialog.row) return;

                                // Build new conversation entry (metadata-only for attachments as before)
                                let attachment = null;
                                if (replyFile) {
                                  attachment = {
                                    id: Date.now().toString(),
                                    name: replyFile.name,
                                    size: replyFile.size,
                                    type: replyFile.type,
                                    dataURL: null // same behavior as your original code
                                  };
                                }

                                // Update local object to push into conversation
                                const updated = { ...(dialog.row || {}) };
                                if (!Array.isArray(updated.conversation)) updated.conversation = [];

                                // Auto-change status from "פתוחה" to "בטיפול" when replying
                                if (updated.status === 'פתוחה') {
                                  updated.status = 'בטיפול';
                                }

                                updated.conversation.push({
                                  sender: 'מנהל',
                                  text: replyText.trim(),
                                  timestamp: Date.now(),
                                  attachment
                                });
                                updated.updatedAt = new Date().toISOString();

                                // ✅ Persist changes to Firestore (prefer doc id, fallback to idNumber)
                                if (updated.id) {
                                  await patchDocById(updated.id, {
                                    status: updated.status,
                                    conversation: updated.conversation,
                                    updatedAt: updated.updatedAt
                                  });
                                } else if (updated.idNumber) {
                                  await patchDocByIdNumber(updated.idNumber, {
                                    status: updated.status,
                                    conversation: updated.conversation,
                                    updatedAt: updated.updatedAt
                                  });
                                }

                                // Reflect in dialog and show snackbar
                                setDialog({ open: true, row: updated });
                                setSnackbar({ open: true, message: 'ההודעה נשלחה' });

                                // Reset reply state
                                setReplyText('');
                                setReplyFile(null);
                                setShowReply(false);
                              }}
                            >
                              שלח
                            </Button>
                          </Box>
                        </Stack>
                      )}
                    </>
                  ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
                      <Button onClick={() => setDialog({ open: false })}>סגור</Button>
                    </Box>
                  )}
                </DialogActions>
              </Dialog>
            </>
          ) : (
            // For other entities, keep your existing EntityTable usage
            <EntityTable entity={entity} rows={rows} />
          )}
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

export default EntityListPage;
