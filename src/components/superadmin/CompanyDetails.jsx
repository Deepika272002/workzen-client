import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import { companies } from '../../services/api';

const CompanyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    active: true
  });

  useEffect(() => {
    const fetchCompanyDetails = async () => {
      try {
        const response = await companies.getOne(id);
        setCompany(response.data);
        setFormData({
          name: response.data.name,
          description: response.data.description,
          active: response.data.active
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch company details');
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyDetails();
  }, [id]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdateCompany = async () => {
    try {
      setError(null);
      const response = await companies.updateCompany(id, formData);
      setCompany(response.data);
      setOpenDialog(false);
      alert('Company updated successfully');
    } catch (error) {
      console.error('Error updating company:', error);
      setError('Failed to update company');
    }
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/super_admin_dashboard')}
        sx={{ mb: 3 }}
      >
        Back to Dashboard
      </Button>

      <Paper sx={{ p: 3, position: 'relative' }}>
        <Typography variant="h4" gutterBottom>
          Company Details
        </Typography>

        <IconButton
          sx={{ position: 'absolute', top: 16, right: 16 }}
          onClick={() => setOpenDialog(true)}
        >
          <EditIcon />
        </IconButton>

        <Box sx={{ mt: 3 }}>
          <Typography variant="h6">Name</Typography>
          <Typography color="text.secondary" paragraph>
            {company?.name}
          </Typography>

          <Typography variant="h6">Description</Typography>
          <Typography color="text.secondary" paragraph>
            {company?.description || 'No description provided'}
          </Typography>

          <Typography variant="h6">Admin</Typography>
          <Typography color="text.secondary" paragraph>
            {company?.admin?.name} ({company?.admin?.email})
          </Typography>

          <Typography variant="h6">Status</Typography>
          <Typography
            color={company?.active ? 'success.main' : 'error.main'}
            paragraph
          >
            {company?.active ? 'Active' : 'Inactive'}
          </Typography>

          <Typography variant="h6">Created At</Typography>
          <Typography color="text.secondary" paragraph>
            {new Date(company?.createdAt).toLocaleDateString()}
          </Typography>
        </Box>
      </Paper>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Company Details</DialogTitle>
        <DialogContent>
          <TextField
            name="name"
            label="Company Name"
            fullWidth
            value={formData.name}
            onChange={handleInputChange}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            name="description"
            label="Description"
            fullWidth
            value={formData.description}
            onChange={handleInputChange}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            name="active"
            label="Active"
            fullWidth
            value={formData.active}
            onChange={handleInputChange}
            required
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={handleUpdateCompany}
            variant="contained"
            disabled={!formData.name || !formData.description}
          >
            Update Company
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CompanyDetails;