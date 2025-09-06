import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEntityByKey } from '@config/entities';
import { readAll, writeAll, exists } from '@lib/storage';
import { generateEmailFromName } from '@lib/emailGenerator';
import { Box, Button, Typography, TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Stack, Divider, Snackbar, Alert, Card, CardContent, IconButton, InputAdornment } from '@mui/material';
import { AttachFile, Delete, CloudUpload, Search } from '@mui/icons-material';
import EntityTable from '@components/EntityTable';
import { getCreatePath } from '@lib/routing';
import EmptyState from '@components/EmptyState';

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

  const handleFileSelect = (file: File) => {
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setSnackbar({ open: true, message: 'גודל הקובץ חייב להיות קטן מ-5MB' });
      return;
    }
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      setSnackbar({ open: true, message: 'סוג קובץ לא נתמך. אנא בחרו קובץ תמונה, PDF או מסמך Word' });
      return;
    }
    
    setReplyFile(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const removeFile = () => {
    setReplyFile(null);
  };

  React.useEffect(() => {
    if (!entity) return;
    
    if ((import.meta as any).env?.DEV) {
      console.log('[ENTITY]', entityKey || 'requests');
    }
    
    try {
      // Load data from storage
      const data = readAll(entity.key) || [];
      if ((import.meta as any).env?.DEV) {
        console.log('[READ]', 'blue-admin:requests', data.length);
      }
      setRows(data);
    } catch (error) {
      console.error('[ENTITY LIST] Failed to load data:', error);
      setRows([]);
    }
  }, [entityKey, entity]);

  // Filter rows based on search term
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

  // Check if user is logged in
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

  // Verify user is admin
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
              </Box>
              
              {/* Search Bar */}
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
          {/* Custom table for requests */}
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
                            onClick={() => {
                              console.log('[OPEN DETAILS]', r.idNumber, 'status ->', r.status);
                              // Auto-change status from פתוחה to בטיפול when opening
                              if (r.status === 'פתוחה') {
                                const data = readAll(entity.key);
                                const idx = data.findIndex((x: any) => x.idNumber === r.idNumber);
                                if (idx >= 0) {
                                  data[idx] = { ...data[idx], status: 'בטיפול' };
                                  writeAll(entity.key, data);
                                  setRows(data);
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

              <Dialog open={dialog.open} onClose={() => { setDialog({ open: false }); setShowReply(false); setReplyText(''); }} fullWidth maxWidth="sm">
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
                    
                    {/* Show attachment if exists */}
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
                              onClick={() => {
                                if (!dialog.row) return;
                                const data = readAll(entity.key);
                                const idx = data.findIndex((x: any) => x.idNumber === dialog.row.idNumber);
                                if (idx >= 0) {
                                  data[idx] = { ...data[idx], status: 'נסגרה' };
                                  writeAll(entity.key, data);
                                  setRows(data);
                                  setDialog({ open: false });
                                  setSnackbar({ open: true, message: 'הפנייה נסגרה' });
                                }
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
                          
                          {/* File Attachment Section */}
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
                                '&:hover': {
                                  backgroundColor: '#f5f5f5',
                                  borderColor: '#1976d2'
                                }
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
                              <Box sx={{ mt: 1, p: 1, backgroundColor: '#f5f5f5', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
                              onClick={() => {
                                if (!dialog.row) return;
                                const data = readAll(entity.key);
                                const idx = data.findIndex((x: any) => x.idNumber === dialog.row.idNumber);
                                if (idx >= 0) {
                                  const updated = { ...data[idx] };
                                  if (!Array.isArray(updated.conversation)) updated.conversation = [];
                                  
                                  // Process file attachment
                                  let attachment = null;
                                  if (replyFile) {
                                    attachment = {
                                      id: Date.now().toString(),
                                      name: replyFile.name,
                                      size: replyFile.size,
                                      type: replyFile.type,
                                      dataURL: null // Store metadata only
                                    };
                                  }
                                  
                                  // Auto-change status from פתוחה to בטיפול when replying
                                  if (updated.status === 'פתוחה') {
                                    updated.status = 'בטיפול';
                                    console.log('[REPLY]', updated.idNumber, 'status->', updated.status);
                                  }
                                  
                                  updated.conversation.push({ 
                                    sender: 'מנהל', 
                                    text: replyText.trim(), 
                                    timestamp: Date.now(),
                                    attachment: attachment
                                  });
                                  updated.updatedAt = new Date().toISOString();
                                  data[idx] = updated;
                                  writeAll(entity.key, data);
                                  setRows(data);
                                  setDialog({ open: true, row: updated });
                                  setSnackbar({ open: true, message: 'ההודעה נשלחה' });
                                }
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


