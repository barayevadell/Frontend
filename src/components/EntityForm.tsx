import React from 'react';
import {
  Box,
  TextField,
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  FormHelperText,
  Snackbar,
  Alert,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';

import type { EntityConfig, Field } from '@config/entities';
import { append } from '@lib/storage';
import { validateRecord, hasErrors } from '@lib/validation';
import { useNavigate } from 'react-router-dom';
import { getListPath } from '@lib/routing';

type EntityFormProps = { entity: EntityConfig };

const getInitialState = (fields: Field[]) => {
  const state: Record<string, unknown> = {};
  fields.forEach((f) => (state[f.key] = ''));
  return state;
};

const EntityForm: React.FC<EntityFormProps> = ({ entity }) => {
  const navigate = useNavigate();
  const [values, setValues] = React.useState<Record<string, unknown>>(
    () => getInitialState(entity.fields)
  );
  const [errors, setErrors] = React.useState<Record<string, string | null>>({});
  const [saved, setSaved] = React.useState(false);

  const handleChange = (key: string, value: unknown) => {
    setValues((v) => ({ ...v, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateRecord(values, entity);
    setErrors(validation);
    if (!hasErrors(validation)) {
      append(entity.key, values);
      setSaved(true);
      setValues(getInitialState(entity.fields));
    }
  };

  const handleReset = () => {
    setValues(getInitialState(entity.fields));
    setErrors({});
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      noValidate
      aria-label={`טופס יצירת ${entity.label}`}
      sx={{ textAlign: 'right' }}
    >
      {/* === פריסה בשתי עמודות ב־md ומעלה, עמודה אחת ב־xs === */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 2,
        }}
      >
        {entity.fields.map((field) => {
          const value = (values[field.key] as string) ?? '';
          const error = errors[field.key];

          const commonProps = {
            required: Boolean(field.required),
            error: Boolean(error),
            helperText: error || ' ',
            fullWidth: true,
            label: field.label,
            name: field.key,
            value,
            onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
              handleChange(field.key, e.target.value),
          } as const;

          return (
            <Box key={field.key}>
              {field.type === 'select' ? (
                <FormControl
                  fullWidth
                  error={Boolean(error)}
                  required={Boolean(field.required)}
                >
                  <InputLabel id={`${field.key}-label`}>{field.label}</InputLabel>
                  <Select
                    labelId={`${field.key}-label`}
                    id={field.key}
                    label={field.label}
                    value={value}
                    onChange={(e: SelectChangeEvent) =>
                      handleChange(field.key, e.target.value)
                    }
                  >
                    {(field.selectOptions || []).map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>{error || ' '}</FormHelperText>
                </FormControl>
              ) : (
                <TextField
                  {...commonProps}
                  type={field.type === 'multiline' ? 'text' : field.type}
                  multiline={field.type === 'multiline'}
                  minRows={field.type === 'multiline' ? 3 : undefined}
                  inputProps={{ 'aria-label': field.label }}
                />
              )}
            </Box>
          );
        })}
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
        <Button type="submit" variant="contained" color="primary">שמירה</Button>
        <Button type="button" variant="outlined" onClick={handleReset}>איפוס</Button>
        <Button type="button" variant="text" onClick={() => navigate(getListPath(entity.key))}>צפייה ברשימה</Button>
        <Button type="button" variant="text" color="inherit" onClick={() => navigate(-1)}>ביטול</Button>
      </Box>

      <Snackbar
        open={saved}
        autoHideDuration={2000}
        onClose={() => setSaved(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled" onClose={() => setSaved(false)}>
          נשמר בהצלחה
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EntityForm;
