// src/pages/...(adjust path)/AdminUsersPage.tsx
import React from 'react';
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
  TextField,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Snackbar,
  Alert,
  Chip,
  TableSortLabel,
  Pagination,
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Person as PersonIcon,
} from '@mui/icons-material';

// ✅ Firestore
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
} from 'firebase/firestore';


import { db } from '../firebase';

import { generateEmailFromName } from '@lib/emailGenerator';

// === Local User type (so we don't depend on external paths) ===
type Role = 'סטודנט' | 'מנהל';
export interface User {
  id?: string;        // Firestore document ID
  idNumber: string;   // 9 digits
  fullName: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: string;  // ISO
  updatedAt: string;  // ISO
}

type SortField = 'fullName' | 'idNumber' | 'email' | 'role' | 'isActive';
type SortDirection = 'asc' | 'desc';

const AdminUsersPage: React.FC = () => {
  // ===== UI state =====
  const [users, setUsers] = React.useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = React.useState<User[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [sortField, setSortField] = React.useState<SortField>('fullName');
  const [sortDirection, setSortDirection] = React.useState<SortDirection>('asc');
  const [page, setPage] = React.useState(1);
  const itemsPerPage = 10;

  const [dialog, setDialog] = React.useState<{ open: boolean; mode: 'add' | 'edit'; user?: User }>({
    open: false,
    mode: 'add',
  });
  const [formData, setFormData] = React.useState<Partial<User>>({});
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [snackbar, setSnackbar] = React.useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  const [deleteDialog, setDeleteDialog] = React.useState<{ open: boolean; user?: User }>({
    open: false,
  });

  // ===== Firestore helpers =====

  /** Load all users from Firestore (collection: 'users') */
  const loadUsers = React.useCallback(async () => {
    try {
      const snap = await getDocs(collection(db, 'users'));
      const data = snap.docs.map((d) => ({ id: d.id, ...(d.data() as User) }));
      setUsers(data);
    } catch (err) {
      console.error('[USERS] load failed:', err);
      setUsers([]);
      setSnackbar({ open: true, message: 'טעינת משתמשים נכשלה', severity: 'error' });
    }
  }, []);

  /** Check if there are any requests for a given user (collection: 'requests') */
  const hasUserRequests = React.useCallback(async (idNumber: string) => {
    try {
      const q = query(collection(db, 'requests'), where('idNumber', '==', idNumber));
      const snap = await getDocs(q);
      return !snap.empty;
    } catch (err) {
      console.error('[USERS] check requests failed:', err);
      // Be safe: if error, treat as "has requests" to avoid accidental delete
      return true;
    }
  }, []);

  // ===== Effects =====

  // Initial load
  React.useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Filter + sort when dependencies change
  React.useEffect(() => {
    const safeUsers = Array.isArray(users) ? users : [];
    let filtered = safeUsers.filter((user) => {
      if (!user) return false;
      const s = searchTerm.toLowerCase();
      return (
        (user.fullName || '').toLowerCase().includes(s) ||
        (user.idNumber || '').includes(searchTerm) ||
        (user.email || '').toLowerCase().includes(s)
      );
    });

    filtered.sort((a: User, b: User) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();

      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    setFilteredUsers(filtered);
    setPage(1);
  }, [users, searchTerm, sortField, sortDirection]);

  // ===== UI handlers =====

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleAddUser = () => {
    setFormData({
      fullName: '',
      idNumber: '',
      email: '',
      role: 'סטודנט',
      isActive: true,
    });
    setErrors({});
    setDialog({ open: true, mode: 'add' });
  };

  const handleEditUser = (user: User) => {
    setFormData({ ...user });
    setErrors({});
    setDialog({ open: true, mode: 'edit', user });
  };

  const handleDeleteUser = (user: User) => {
    setDeleteDialog({ open: true, user });
  };

  const handleToggleActive = async (user: User) => {
    try {
      if (!user.id) return;
      await updateDoc(doc(db, 'users', user.id), { isActive: !user.isActive, updatedAt: new Date().toISOString() });
      await loadUsers();
      setSnackbar({
        open: true,
        message: `המשתמש ${user.isActive ? 'הושבת' : 'הופעל'}`,
        severity: 'success',
      });
    } catch (err) {
      console.error('[USERS] toggle active failed:', err);
      setSnackbar({ open: true, message: 'פעולה נכשלה', severity: 'error' });
    }
  };

  // Auto-generate email while typing name (can still be edited)
  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      fullName: name,
      email: name.trim() ? generateEmailFromName(name.trim()) : prev.email,
    }));
  };

  // ===== Validation =====
  const validateForm = async (): Promise<boolean> => {
    const newErrors: Record<string, string> = {};

    // fullName
    if (!formData.fullName?.trim()) {
      newErrors.fullName = 'יש להזין שם מלא תקין';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'השם חייב להכיל לפחות 2 תווים';
    }

    // idNumber
    if (!formData.idNumber?.trim() || !/^\d{9}$/.test(formData.idNumber)) {
      newErrors.idNumber = 'יש להזין מספר תעודת זהות בן 9 ספרות';
    } else {
      // Uniqueness check in Firestore when adding / or changing idNumber
      const qSameId = query(collection(db, 'users'), where('idNumber', '==', formData.idNumber));
      const snap = await getDocs(qSameId);
      const existsInDb = snap.docs.some((d) => d.id !== (dialog.user?.id ?? ''));
      if (existsInDb) {
        newErrors.idNumber = 'תעודת זהות קיימת במערכת';
      }
    }

    // email
    if (!formData.email?.trim() || !formData.email.includes('@')) {
      newErrors.email = 'כתובת אימייל לא תקינה';
    }

    // role
    if (!formData.role) {
      newErrors.role = 'יש לבחור תפקיד';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save (add/edit) user in Firestore
  const handleSaveUser = async () => {
    if (!(await validateForm())) return;

    const now = new Date().toISOString();
    const toSave: Omit<User, 'id'> = {
      idNumber: formData.idNumber!,
      fullName: formData.fullName!.trim(),
      email: formData.email!.trim(),
      role: formData.role as Role,
      isActive: formData.isActive ?? true,
      createdAt: dialog.mode === 'add' ? now : (dialog.user?.createdAt || now),
      updatedAt: now,
    };

    try {
      if (dialog.mode === 'add') {
        await addDoc(collection(db, 'users'), toSave);
      } else {
        if (!dialog.user?.id) return;
        await updateDoc(doc(db, 'users', dialog.user.id), toSave);
      }
      setDialog({ open: false, mode: 'add' });
      await loadUsers();
      setSnackbar({ open: true, message: 'המשתמש נשמר', severity: 'success' });
    } catch (err) {
      console.error('[USERS] save failed:', err);
      setSnackbar({ open: true, message: 'שמירת משתמש נכשלה', severity: 'error' });
    }
  };

  // Confirm delete with "has requests" guard
  const handleConfirmDelete = async () => {
    const u = deleteDialog.user;
    if (!u) return;

    try {
      const hasReq = await hasUserRequests(u.idNumber);
      if (hasReq) {
        setSnackbar({
          open: true,
          message: 'לא ניתן למחוק משתמש עם פניות פעילות/היסטוריות. אפשר להשבית במקום.',
          severity: 'error',
        });
        setDeleteDialog({ open: false });
        return;
      }

      if (!u.id) return;
      await deleteDoc(doc(db, 'users', u.id));
      setDeleteDialog({ open: false });
      await loadUsers();
      setSnackbar({ open: true, message: 'המשתמש נמחק', severity: 'success' });
    } catch (err) {
      console.error('[USERS] delete failed:', err);
      setSnackbar({ open: true, message: 'מחיקה נכשלה', severity: 'error' });
    }
  };

  // ===== Pagination derived values =====
  const safeFiltered = Array.isArray(filteredUsers) ? filteredUsers : [];
  const paginatedUsers = safeFiltered.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const totalPages = Math.ceil(safeFiltered.length / itemsPerPage);

  return (
    <Box dir="rtl">
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" sx={{ textAlign: 'right' }}>
          ניהול משתמשים
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddUser} sx={{ px: 3 }}>
          הוסף משתמש
        </Button>
      </Box>

      {/* Search */}
      <TextField
        fullWidth
        placeholder="חיפוש לפי שם, תעודת זהות או אימייל..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 3 }}
      />

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: (t) => t.palette.primary.main }}>
              <TableCell align="right" sx={{ color: '#111', fontWeight: 800 }}>
                <TableSortLabel
                  active={sortField === 'fullName'}
                  direction={sortField === 'fullName' ? sortDirection : 'asc'}
                  onClick={() => handleSort('fullName')}
                  sx={{ color: '#111 !important' }}
                >
                  שם מלא
                </TableSortLabel>
              </TableCell>
              <TableCell align="right" sx={{ color: '#111', fontWeight: 800 }}>
                <TableSortLabel
                  active={sortField === 'idNumber'}
                  direction={sortField === 'idNumber' ? sortDirection : 'asc'}
                  onClick={() => handleSort('idNumber')}
                  sx={{ color: '#111 !important' }}
                >
                  תעודת זהות
                </TableSortLabel>
              </TableCell>
              <TableCell align="right" sx={{ color: '#111', fontWeight: 800 }}>
                <TableSortLabel
                  active={sortField === 'email'}
                  direction={sortField === 'email' ? sortDirection : 'asc'}
                  onClick={() => handleSort('email')}
                  sx={{ color: '#111 !important' }}
                >
                  אימייל
                </TableSortLabel>
              </TableCell>
              <TableCell align="right" sx={{ color: '#111', fontWeight: 800 }}>
                <TableSortLabel
                  active={sortField === 'role'}
                  direction={sortField === 'role' ? sortDirection : 'asc'}
                  onClick={() => handleSort('role')}
                  sx={{ color: '#111 !important' }}
                >
                  תפקיד
                </TableSortLabel>
              </TableCell>
              <TableCell align="right" sx={{ color: '#111', fontWeight: 800 }}>
                <TableSortLabel
                  active={sortField === 'isActive'}
                  direction={sortField === 'isActive' ? sortDirection : 'asc'}
                  onClick={() => handleSort('isActive')}
                  sx={{ color: '#111 !important' }}
                >
                  סטטוס משתמש
                </TableSortLabel>
              </TableCell>
              <TableCell align="right" sx={{ color: '#111', fontWeight: 800 }}>
                פעולות
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {paginatedUsers.length > 0 ? (
              paginatedUsers.map((user) => (
                <TableRow key={user.id ?? user.idNumber} hover>
                  <TableCell align="right">{user.fullName}</TableCell>
                  <TableCell align="right">{user.idNumber}</TableCell>
                  <TableCell align="right">{user.email}</TableCell>
                  <TableCell align="right">
                    <Chip label={user.role} color={user.role === 'מנהל' ? 'primary' : 'default'} size="small" />
                  </TableCell>
                  <TableCell align="right">
                    <Chip label={user.isActive ? 'פעיל' : 'לא פעיל'} color={user.isActive ? 'success' : 'error'} size="small" />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <IconButton size="small" onClick={() => handleEditUser(user)} color="primary">
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleToggleActive(user)} color={user.isActive ? 'warning' : 'success'}>
                        <PersonIcon />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDeleteUser(user)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">אין משתמשים זמינים</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination count={totalPages} page={page} onChange={(_, newPage) => setPage(newPage)} color="primary" />
        </Box>
      )}

      {/* Add/Edit dialog */}
      <Dialog open={dialog.open} onClose={() => setDialog({ open: false, mode: 'add' })} fullWidth maxWidth="sm">
        <DialogTitle>{dialog.mode === 'add' ? 'הוספת משתמש חדש' : 'עריכת משתמש'}</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="שם מלא"
              value={formData.fullName || ''}
              onChange={(e) => handleNameChange(e.target.value)}
              error={Boolean(errors.fullName)}
              helperText={errors.fullName}
              required
            />
            <TextField
              fullWidth
              label="תעודת זהות"
              value={formData.idNumber || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, idNumber: e.target.value }))}
              error={Boolean(errors.idNumber)}
              helperText={errors.idNumber}
              inputProps={{ maxLength: 9 }}
              required
            />
            <TextField
              fullWidth
              label="אימייל"
              value={formData.email || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              error={Boolean(errors.email)}
              helperText={errors.email}
              required
            />
            <FormControl fullWidth required error={Boolean(errors.role)}>
              <InputLabel>תפקיד</InputLabel>
              <Select
                value={formData.role || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value as Role }))}
                label="תפקיד"
              >
                <MenuItem value="סטודנט">סטודנט</MenuItem>
                <MenuItem value="מנהל">מנהל</MenuItem>
              </Select>
              {errors.role && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, mr: 2 }}>
                  {errors.role}
                </Typography>
              )}
            </FormControl>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive ?? true}
                  onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
                />
              }
              label="פעיל"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog({ open: false, mode: 'add' })}>ביטול</Button>
          <Button variant="contained" onClick={handleSaveUser}>
            שמירה
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete dialog */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false })}>
        <DialogTitle>מחיקת משתמש</DialogTitle>
        <DialogContent>
          <Typography>למחוק את המשתמש {deleteDialog.user?.fullName}? פעולה זו לא ניתנת לשחזור.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false })}>ביטול</Button>
          <Button variant="contained" color="error" onClick={handleConfirmDelete}>
            מחיקה
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ open: false, message: '', severity: 'success' })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ open: false, message: '', severity: 'success' })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminUsersPage;
