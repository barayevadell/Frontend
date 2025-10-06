import React, { useContext } from 'react';
import { useParams } from 'react-router-dom';
import { getEntityByKey } from '@config/entities';
import { Box, Typography } from '@mui/material';
import EntityForm from '@components/EntityForm';
import Loader from '../../components/Loader';
import { LoadingContext } from '../../App';

// ✅ Import Firestore connection and functions
import { db } from '../../firebase';
import { collection, addDoc } from 'firebase/firestore';

const EntityCreatePage: React.FC = () => {
  const { entityKey } = useParams();
  const entity = getEntityByKey(entityKey || '');
  const { setLoading } = useContext(LoadingContext);

  // If entity is not found, display a message
  if (!entity) {
    return <Typography>Entity not found.</Typography>;
  }

  // ✅ Function to save data to Firestore
  const handleSave = async (data: any) => {
    try {
      setLoading(true);
      if (!entityKey) return;

      // Add a new document to the Firestore collection that matches the entity key
      await addDoc(collection(db, entityKey), data);

      console.log('✅ Document successfully created with ID:');
      alert('Entity has been successfully added!');
    } catch (error) {
      console.error('❌ Error saving to Firestore:', error);
      alert('An error occurred while saving.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 2, textAlign: 'right' }}>
        Create new {entity.label}
      </Typography>

      {/* ✅ Pass the save function as a prop to EntityForm */}
      <EntityForm entity={entity} onSubmit={handleSave} />
    </Box>
  );
};

export default EntityCreatePage;
