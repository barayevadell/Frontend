import React, { useContext } from 'react';
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
import { generateEmailFromName } from '@lib/emailGenerator';
import { LoadingContext } from '../App';

// Firestore imports
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';

const StudentRequestFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { setLoading } = useContext(LoadingContext);
  const [subject, setSubject] = React.useState('');
  const [fullName, setFullName] = React.useState(''); // 👈 new field
  const [details, setDetails] = React.useState('');
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [errors, setErrors] = React.useState<{ subject?: string; details?: string; file?: string }>({});
  const [snackbar, setSnackbar] = React.useState<{ open: boolean; message: string }>({ open: false, message: '' });

  const subjectOptions = ['קורסים', 'מערכת שעות', 'בחינות ועבודות', 'אישורים ומסמכים', 'שכר לימוד', 'אחר'];

  // Get logged-in user from localStorage
  const user = React.useMemo(() => {
    try {
      const raw = localStorage.getItem('blue-admin:user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const handleFileSelect = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      setErrors((e) => ({ ...e, file: 'גודל הקובץ חייב להיות קטן מ-10MB' }));
      return;
    }

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
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

  const removeFile = () => {
    setSelectedFile(null);
    setErrors((e) => ({ ...e, file: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    const nextErrors: { subject?: string; details?: string; file?: string } = {};
    if (!subject.trim()) nextErrors.subject = 'יש לבחור נושא';
    if (!details.trim()) nextErrors.details = 'שדה חובה';
    else if (details.trim().length < 10) nextErrors.details = 'התיאור חייב להכיל לפחות 10 תווים';
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length === 0 && user) {
      let attachment = null;
      if (selectedFile) {
        attachment = {
          id: Date.now().toString(),
          name: selectedFile.name,
          size: selectedFile.size,
          type: selectedFile.type,
        };
      }

      const now = Timestamp.now();
      const newRequest = {
        idNumber: user.idNumber || '',
        name: fullName || '', // 👈 save entered name
        email: generateEmailFromName(fullName || ''),
        role: 'סטודנט',
        status: 'פתוחה',
        subject,
        details: details.trim(),
        attachments: attachment ? [attachment] : [],
        createdAt: now,
        updatedAt: now,
        conversation: [
          {
            sender: 'סטודנט',
            text: details.trim() + (attachment ? `\n\n[קובץ מצורף: ${attachment.name}]` : ''),
            timestamp: now,
          },
        ],
      };

      try {
        setLoading(true);
        // Save to Firestore only
        await addDoc(collection(db, 'requests'), newRequest);
        setSnackbar({ open: true, message: 'הפנייה נשלחה בהצלחה' });
        setTimeout(() => navigate('/student/requests'), 1500);
      } catch (error) {
        console.error('[ERROR saving request]', error);
        setSnackbar({ open: true, message: 'שגיאה בשליחת הפנייה' });
      } finally {
        setLoading(false);
      }
    }
  };

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
          textAlign: 'right',
        }}
      >
        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={3}>
            {/* === Subject selection === */}
            <FormControl
              fullWidth
              required
              error={Boolean(errors.subject)}
              variant="outlined"
              sx={{
                '& .MuiInputLabel-root': {
                  right: 24,
                  left: 'auto',
                  transformOrigin: 'top right',
                  textAlign: 'right',
                },
                '& .MuiSelect-select': { textAlign: 'right' },
                '& .MuiOutlinedInput-notchedOutline': {
                  textAlign: 'right',
                  direction: 'rtl',
                },
                '& legend': { right: 8, left: 'auto', width: 'auto' },
              }}
            >
              <InputLabel id="subject-label">נושא</InputLabel>
              <Select
                labelId="subject-label"
                label="נושא"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                sx={{ textAlign: 'right', direction: 'rtl' }}
                MenuProps={{
                  PaperProps: {
                    dir: 'rtl',
                    style: { textAlign: 'right' },
                  },
                }}
              >
                {subjectOptions.map((option) => (
                  <MenuItem key={option} value={option} sx={{ textAlign: 'right' }}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
              {errors.subject && (
                <Typography variant="caption" color="error">
                  {errors.subject}
                </Typography>
              )}
            </FormControl>

            {/* === Full name field === */}
            <TextField
              fullWidth
              label="שם מלא"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  textAlign: 'right',
                  direction: 'rtl',
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  textAlign: 'right',
                  direction: 'rtl',
                },
                '& legend': { right: 8, left: 'auto', width: 'auto' },
                '& .MuiInputLabel-root': {
                  right: 24,
                  left: 'auto',
                  transformOrigin: 'top right',
                },
              }}
              inputProps={{ style: { textAlign: 'right', direction: 'rtl' } }}
            />

            {/* === Request details === */}
            <TextField
              fullWidth
              required
              multiline
              rows={6}
              label="פירוט הפנייה"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              error={Boolean(errors.details)}
              helperText={errors.details || ' '}
              sx={{
                '& .MuiOutlinedInput-root': {
                  textAlign: 'right',
                  direction: 'rtl',
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  textAlign: 'right',
                  direction: 'rtl',
                },
                '& legend': { right: 8, left: 'auto', width: 'auto' },
                '& .MuiInputLabel-root': {
                  right: 24,
                  left: 'auto',
                  transformOrigin: 'top right',
                },
              }}
              inputProps={{ style: { textAlign: 'right', direction: 'rtl' } }}
            />

            {/* === File upload === */}
            <Card variant="outlined">
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, textAlign: 'right' }}>
                <CloudUpload />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    הוספת קובץ (לא חובה)
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    גררו קובץ לכאן או לחצו על "בחר/י קובץ"
                  </Typography>
                </Box>
                <input id="file-input" type="file" onChange={handleFileInputChange} hidden />
                <label htmlFor="file-input">
                  <Button variant="outlined" startIcon={<AttachFile />} component="span">
                    בחר/י קובץ
                  </Button>
                </label>
              </CardContent>

              {selectedFile && (
                <Box sx={{ px: 2.5, pb: 2.5, display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>{selectedFile.name}</Typography>
                  <IconButton aria-label="מחיקה" onClick={removeFile}>
                    <Delete />
                  </IconButton>
                </Box>
              )}
            </Card>

            {/* === Buttons === */}
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
      >
        <Alert severity="success" variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default StudentRequestFormPage;
