import React from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Stack,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  IconButton,
} from '@mui/material';
import { AttachFile, Delete, CloudUpload } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { readAll, writeAll } from '@lib/storage';
import { generateEmailFromName } from '@lib/emailGenerator';

const StudentRequestFormPage: React.FC = () => {
  const navigate = useNavigate();
  const [subject, setSubject] = React.useState('');
  const [details, setDetails] = React.useState('');
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [isDragOver, setIsDragOver] = React.useState(false);
  const [errors, setErrors] = React.useState<{ subject?: string; details?: string; file?: string }>({});
  const [snackbar, setSnackbar] = React.useState<{ open: boolean; message: string }>({ open: false, message: '' });

  const subjectOptions = ['קורסים', 'מערכת שעות', 'בחינות ועבודות', 'אישורים ומסמכים', 'שכר לימוד', 'אחר'];

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
      <Box sx={{ display: 'grid', placeItems: 'center', minHeight: '60vh' }} dir="rtl">
        <Paper sx={{ p: 4, borderRadius: 3, width: '100%', maxWidth: 520 }}>
          <Typography variant="h5" sx={{ mb: 1, textAlign: 'right' }}>
            נדרש להתחבר
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3, textAlign: 'right' }}>
            כדי לפתוח פנייה חדשה, יש להתחבר למערכת.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
            <Button variant="contained" href="/" sx={{ px: 4 }}>
              התחבר/י
            </Button>
          </Box>
        </Paper>
      </Box>
    );
  }

  const handleFileSelect = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      setErrors((e) => ({ ...e, file: 'גודל הקובץ חייב להיות קטן מ-10MB' }));
      return;
    }
    
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif',
      'application/pdf', 'text/plain',
      'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (!allowedTypes.includes(file.type)) {
      setErrors((e) => ({ ...e, file: 'סוג קובץ לא נתמך. אנא בחרו קובץ תמונה, PDF או מסמך Word' }));
      return;
    }
    setSelectedFile(file);
    setErrors((e) => ({ ...e, file: undefined }));
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragOver(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragOver(false); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const removeFile = () => { setSelectedFile(null); setErrors((e) => ({ ...e, file: undefined })); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: { subject?: string; details?: string; file?: string } = {};
    if (!subject.trim()) nextErrors.subject = 'יש לבחור נושא';
    if (!details.trim()) nextErrors.details = 'שדה חובה';
    else if (details.trim().length < 10) nextErrors.details = 'התיאור חייב להכיל לפחות 10 תווים';
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length === 0) {
      const userStr = localStorage.getItem('blue-admin:user');
      if (!userStr) { navigate('/'); return; }
      const user = JSON.parse(userStr);

      let attachment = null;
      if (selectedFile) {
        attachment = {
          id: Date.now().toString(),
          name: selectedFile.name,
          size: selectedFile.size,
          type: selectedFile.type,
          dataURL: null,
        };
      }

      const now = new Date().toISOString();
      const studentName = 'סטודנט';
      const newRequest = {
        idNumber: user.idNumber,
        name: studentName,
        email: generateEmailFromName(studentName),
        role: 'סטודנט',
        status: 'פתוחה',
        subject: subject,
        details: details.trim(),
        attachments: attachment ? [attachment] : [],
        createdAt: now,
        updatedAt: now,
        conversation: [{
          sender: 'סטודנט',
          text: details.trim() + (attachment ? `\n\n[קובץ מצורף: ${attachment.name}]` : ''),
          timestamp: Date.now()
        }],
      };

      const existingRequests = readAll('requests') || [];
      existingRequests.push(newRequest);
      writeAll('requests', existingRequests);

      setSnackbar({ open: true, message: 'הפניה הוגשה' });
      setTimeout(() => { navigate('/student/requests'); }, 1500);
    }
  };

  // --- חור קטן וצמוד כשהלייבל מכווץ ---
  const notchLegendShrink = {
    width: '10px',      // חור קטן קבוע
    maxWidth: '10px',
    padding: 0,         // בלי רווחים פנימיים
    marginRight: '6px', // רווח קטן מהמסגרת
    marginLeft: 0,
    float: 'unset',
    textAlign: 'right',
    // מסתיר את ה-span שמודד את רוחב הטקסט כדי שלא יגדיל את החור
    '& > span': { display: 'none' },
  } as const;

  return (
    <Box sx={{ px: { xs: 2, md: 0 }, py: 3 }} dir="rtl">
      <Typography variant="h4" sx={{ mb: 2, textAlign: 'right', fontWeight: 700 }}>
        פנייה חדשה
      </Typography>

      <Paper
        sx={{
          p: { xs: 2, md: 3 },
          borderRadius: 3,
          maxWidth: 820,
          mx: 'auto',
          boxShadow: (t) => t.shadows[3],
        }}
      >
        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={3}>
            {/* Subject */}
            <FormControl
              fullWidth
              required
              error={Boolean(errors.subject)}
              dir="rtl"
              variant="outlined"
              sx={{
                // אין חור כשהלייבל לא מכווץ
                '& .MuiOutlinedInput-notchedOutline legend': { width: 0 },
                // חור קטן וצמוד רק כשהלייבל מכווץ
                '& .MuiInputLabel-shrink ~ .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline legend':
                  notchLegendShrink,
              }}
            >
              <InputLabel
                id="subject-label"
                sx={{
                  right: 18,
                  left: 'auto',
                  bgcolor: 'background.paper',
                  px: 0.75,
                  lineHeight: 1.1,
                  transformOrigin: 'top right',
                }}
              >
                נושא
              </InputLabel>
              <Select
                labelId="subject-label"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                label="נושא"
                sx={{
                  '& .MuiSelect-select': { textAlign: 'right', pr: 2.5, pl: 4.5 },
                  '& .MuiSelect-icon': { left: 8, right: 'auto' },
                }}
                MenuProps={{ PaperProps: { sx: { textAlign: 'right', direction: 'rtl' } } }}
              >
                {subjectOptions.map((option) => (
                  <MenuItem key={option} value={option} sx={{ textAlign: 'right' }}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
              {errors.subject && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, textAlign: 'right' }}>
                  {errors.subject}
                </Typography>
              )}
            </FormControl>

            {/* Details */}
            <TextField
              fullWidth
              required
              multiline
              rows={6}
              label="פירוט הפנייה"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              error={Boolean(errors.details)}
              helperText={errors.details || 'תארו את הבעיה או השאלה שלכם בפירוט'}
              placeholder="כתבו כאן את תיאור הבעיה או השאלה שלכם..."
              InputLabelProps={{
                sx: {
                  right: 18,
                  left: 'auto',
                  transformOrigin: 'top right',
                  bgcolor: 'background.paper',
                  px: 0.75,
                },
              }}
              sx={{
                // אין חור כשהלייבל לא מכווץ
                '& .MuiOutlinedInput-notchedOutline legend': { width: 0 },
                // חור קטן וצמוד רק כשהלייבל מכווץ
                '& .MuiInputLabel-shrink ~ .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline legend':
                  notchLegendShrink,

                '& .MuiOutlinedInput-root': { direction: 'rtl' },
                '& .MuiInputBase-inputMultiline': {
                  textAlign: 'right',
                  paddingTop: '14px',
                  paddingRight: '16px',
                  paddingBottom: '14px',
                },
                '& textarea': { textAlign: 'right', direction: 'rtl' },
                '& textarea::placeholder': { textAlign: 'right', opacity: 0.8 },
              }}
              FormHelperTextProps={{ sx: { textAlign: 'right', m: 0 } }}
            />

            {/* File Upload */}
            <Card
              variant="outlined"
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={(e) => { e.preventDefault(); setIsDragOver(false); }}
              onDrop={(e) => {
                e.preventDefault(); setIsDragOver(false);
                const file = e.dataTransfer.files[0];
                if (file) handleFileSelect(file);
              }}
              sx={{
                borderStyle: 'dashed',
                borderColor: isDragOver ? 'primary.main' : 'divider',
                bgcolor: isDragOver ? 'action.hover' : 'background.paper',
                transition: 'all 0.15s ease',
              }}
            >
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <CloudUpload />
                <Box sx={{ flex: 1, textAlign: 'right' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                    הוספת קובץ (לא חובה)
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    גררו קובץ לכאן או לחצו על "בחר/י קובץ". תמונה, PDF או Word עד 10MB.
                  </Typography>
                </Box>
                <input
                  id="file-input"
                  type="file"
                  onChange={handleFileInputChange}
                  hidden
                  accept=".jpg,.jpeg,.png,.gif,.pdf,.txt,.doc,.docx"
                />
                <label htmlFor="file-input">
                  <Button variant="outlined" startIcon={<AttachFile />} component="span">
                    בחר/י קובץ
                  </Button>
                </label>
              </CardContent>

              {selectedFile && (
                <Box sx={{ px: 2.5, pb: 2.5, display: 'flex', alignItems: 'center', gap: 1.5, justifyContent: 'space-between' }}>
                  <Typography sx={{ textAlign: 'right', flex: 1 }}>
                    {selectedFile.name} • {(selectedFile.size / (1024 * 1024)).toFixed(2)}MB
                  </Typography>
                  <IconButton aria-label="מחיקה" onClick={removeFile}>
                    <Delete />
                  </IconButton>
                </Box>
              )}

              {errors.file && (
                <Typography variant="caption" color="error" sx={{ px: 2.5, pb: 2, textAlign: 'right', display: 'block' }}>
                  {errors.file}
                </Typography>
              )}
            </Card>

            {/* Actions */}
            <Stack direction="row-reverse" spacing={2} justifyContent="space-between">
              <Button type="submit" variant="contained">
                שליחת פנייה
              </Button>
              <Button variant="outlined" onClick={() => navigate('/student/requests')}>
                ביטול
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Paper>

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

export default StudentRequestFormPage;
