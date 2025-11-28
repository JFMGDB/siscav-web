'use client';

import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Box,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { apiClient, AuthorizedPlate } from '@/lib/api-client';

export default function WhitelistTable() {
  const [plates, setPlates] = useState<AuthorizedPlate[]>([]);
  const [open, setOpen] = useState(false);
  const [currentPlate, setCurrentPlate] = useState<Partial<AuthorizedPlate>>({});
  const [loading, setLoading] = useState(true);

  const fetchPlates = async () => {
    try {
      const data = await apiClient.getWhitelist();
      setPlates(data);
    } catch (error) {
      console.error('Failed to fetch whitelist', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlates();
  }, []);

  const handleOpen = (plate?: AuthorizedPlate) => {
    if (plate) {
      setCurrentPlate(plate);
    } else {
      setCurrentPlate({});
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setCurrentPlate({});
  };

  const handleSave = async () => {
    if (currentPlate.plate) {
      // Mock save logic
      if (currentPlate.id) {
        // Update
        setPlates(plates.map(p => p.id === currentPlate.id ? { ...p, ...currentPlate } as AuthorizedPlate : p));
      } else {
        // Create
        const newPlate = await apiClient.addPlate(currentPlate.plate, currentPlate.description);
        setPlates([...plates, newPlate]);
      }
    }
    handleClose();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this plate?')) {
      await apiClient.removePlate(id);
      setPlates(plates.filter((p) => p.id !== id));
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5">Authorized Vehicles</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>
          Add Vehicle
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Plate</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} align="center">Loading...</TableCell>
              </TableRow>
            ) : plates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">No plates found.</TableCell>
              </TableRow>
            ) : (
              plates.map((plate) => (
                <TableRow key={plate.id}>
                  <TableCell>{plate.plate}</TableCell>
                  <TableCell>{plate.description || '-'}</TableCell>
                  <TableCell>{new Date(plate.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleOpen(plate)} color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(plate.id)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{currentPlate.id ? 'Edit Vehicle' : 'Add Vehicle'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="License Plate"
            fullWidth
            value={currentPlate.plate || ''}
            onChange={(e) => setCurrentPlate({ ...currentPlate, plate: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            value={currentPlate.description || ''}
            onChange={(e) => setCurrentPlate({ ...currentPlate, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
