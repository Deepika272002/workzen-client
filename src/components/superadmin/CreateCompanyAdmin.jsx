import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
// import { authService } from '../../services/authService';
import { useAuth } from '../../Context/AuthContext';

const CreateCompanyAdmin = ({ open, handleClose, companyId, companyName, onAdminCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'company_admin',
    company: companyId
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      await useAuth.register({
        ...formData,
        role: 'company_admin',
        company: companyId
      });
      onAdminCreated();
      handleClose();
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'company_admin',
        company: companyId
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create company admin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create Company Admin for {companyName}</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <TextField
          margin="dense"
          label="Full Name"
          name="name"
          fullWidth
          required
          value={formData.name}
          onChange={handleChange}
          disabled={loading}
        />
        <TextField
          margin="dense"
          label="Email"
          name="email"
          type="email"
          fullWidth
          required
          value={formData.email}
          onChange={handleChange}
          disabled={loading}
        />
        <TextField
          margin="dense"
          label="Password"
          name="password"
          type="password"
          fullWidth
          required
          value={formData.password}
          onChange={handleChange}
          disabled={loading}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !formData.name || !formData.email || !formData.password}
        >
          {loading ? <CircularProgress size={24} /> : 'Create Admin'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateCompanyAdmin; 