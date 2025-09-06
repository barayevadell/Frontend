import React from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  Box,
  Typography,
} from '@mui/material';
import type { EntityConfig } from '@config/entities';

type Order = 'asc' | 'desc';

type EntityTableProps = {
  entity: EntityConfig;
  rows: any[];
};

const comparator = (a: any, b: any, key: string, order: Order) => {
  const av = a?.[key];
  const bv = b?.[key];
  if (av == null && bv == null) return 0;
  if (av == null) return order === 'asc' ? -1 : 1;
  if (bv == null) return order === 'asc' ? 1 : -1;
  const avNum = Number(av);
  const bvNum = Number(bv);
  if (!Number.isNaN(avNum) && !Number.isNaN(bvNum)) {
    return order === 'asc' ? avNum - bvNum : bvNum - avNum;
  }
  const avDate = Date.parse(av);
  const bvDate = Date.parse(bv);
  if (!Number.isNaN(avDate) && !Number.isNaN(bvDate)) {
    return order === 'asc' ? avDate - bvDate : bvDate - avDate;
  }
  return order === 'asc'
    ? String(av).localeCompare(String(bv))
    : String(bv).localeCompare(String(av));
};

const EntityTable: React.FC<EntityTableProps> = ({ entity, rows }) => {
  const [orderBy, setOrderBy] = React.useState(entity.idField);
  const [order, setOrder] = React.useState<Order>('asc');
  const [search, setSearch] = React.useState('');

  const handleSort = (key: string) => {
    if (orderBy === key) {
      setOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    } else {
      setOrderBy(key);
      setOrder('asc');
    }
  };

  const filtered = React.useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.toLowerCase();
    return rows.filter((r) =>
      entity.fields.some((f) => String(r?.[f.key] ?? '').toLowerCase().includes(q))
    );
  }, [rows, search, entity.fields]);

  const sorted = React.useMemo(() => {
    const copy = [...filtered];
    copy.sort((a, b) => comparator(a, b, orderBy, order));
    return copy;
  }, [filtered, orderBy, order]);

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2, justifyContent: 'flex-end' }}>
        <Typography variant="subtitle1">מציג {sorted.length} רשומות</Typography>
        <TextField
          size="small"
          label="חיפוש"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          inputProps={{ 'aria-label': 'חיפוש בטבלה' }}
        />
      </Box>
      <TableContainer component={Paper} aria-label={`טבלת ${entity.label}`}>
        <Table>
          <TableHead>
            <TableRow>
              {entity.fields.map((f) => (
                <TableCell key={f.key} sortDirection={orderBy === f.key ? order : false} align="right">
                  <TableSortLabel
                    active={orderBy === f.key}
                    direction={orderBy === f.key ? order : 'asc'}
                    onClick={() => handleSort(f.key)}
                  >
                    {f.label}
                  </TableSortLabel>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {sorted.map((row, idx) => (
              <TableRow key={idx} hover>
                {entity.fields.map((f) => (
                  <TableCell key={f.key} align="right">{String(row?.[f.key] ?? '')}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default EntityTable;


