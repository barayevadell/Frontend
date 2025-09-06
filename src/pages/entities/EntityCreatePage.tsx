import React from 'react';
import { useParams } from 'react-router-dom';
import { getEntityByKey } from '@config/entities';
import { Box, Typography } from '@mui/material';
import EntityForm from '@components/EntityForm';

const EntityCreatePage: React.FC = () => {
  const { entityKey } = useParams();
  const entity = getEntityByKey(entityKey || '');

  if (!entity) {
    return <Typography>ישות לא נמצאה.</Typography>;
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 2, textAlign: 'right' }}>
        יצירת {entity.label} חדשה
      </Typography>
      <EntityForm entity={entity} />
    </Box>
  );
};

export default EntityCreatePage;


