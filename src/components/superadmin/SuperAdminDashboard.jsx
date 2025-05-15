import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PersonAdd as PersonAddIcon,
} from '@mui/icons-material';
import { useAuth } from '../../Context/AuthContext';
import api from '../../services/api';
import CreateCompanyAdmin from './CreateCompanyAdmin';

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newCompany, setNewCompany] = useState({
    name: '',
    description: '',
    admin: {
      name: '',
      email: '',
      password: '',
    }
  });
  const [stats, setStats] = useState({
    totalCompanies: 0,
    activeCompanies: 0,
    totalUsers: 0,
  });
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [openAdminDialog, setOpenAdminDialog] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [companiesRes, statsRes] = await Promise.all([
        api.get('/companies'),
        api.get('/companies/stats'),
      ]);
      setCompanies(companiesRes.data);
      setStats(statsRes.data);
    } catch (error) {
      if (error.response?.status === 403) {
        setError('Access denied. Please log in with appropriate credentials.');
      } else {
        setError(error.response?.data?.message || 'An error occurred while fetching data');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCompany = async () => {
    try {
      setError(null);
      
      // Validate form data
      if (!newCompany.name.trim()) {
        setError('Company name is required');
        return;
      }
      if (!newCompany.admin.name.trim() || 
          !newCompany.admin.email.trim() || 
          !newCompany.admin.password.trim()) {
        setError('All admin details are required');
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newCompany.admin.email)) {
        setError('Please enter a valid email address');
        return;
      }

      // Create company with admin details
      const requestData = {
        name: newCompany.name.trim(),
        description: newCompany.description.trim(),
        admin: {
          name: newCompany.admin.name.trim(),
          email: newCompany.admin.email.trim(),
          password: newCompany.admin.password
        }
      };

      console.log('Sending request:', requestData); // Debug log

      const response = await api.post('/companies/with-admin', requestData);
      
      if (response.data) {
        setOpenDialog(false);
        setNewCompany({
          name: '',
          description: '',
          admin: {
            name: '',
            email: '',
            password: '',
          }
        });
        fetchData();
      }
    } catch (error) {
      console.error('Error creating company:', error);
      setError(
        error.response?.data?.message || 
        error.message || 
        'Failed to create company and admin'
      );
    }
  };

  const handleViewCompany = (companyId) => {
    navigate(`/companies/${companyId}`);
  };

  const handleCreateAdmin = (company) => {
    setSelectedCompany(company);
    setOpenAdminDialog(true);
  };

  const handleAdminCreated = () => {
    fetchData(); // Refresh the companies list
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4, marginTop: 15 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4">Super Admin Dashboard</Typography>
        <Button 
          variant="contained" 
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Create New Company
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Paper 
            sx={{ 
              p: 3, 
              textAlign: 'center', 
              bgcolor: 'primary.light', 
              color: 'white',
              height: '100%'
            }}
          >
            <Typography variant="h6">Total Companies</Typography>
            <Typography variant="h3">{stats.totalCompanies}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper 
            sx={{ 
              p: 3, 
              textAlign: 'center', 
              bgcolor: 'success.light', 
              color: 'white',
              height: '100%'
            }}
          >
            <Typography variant="h6">Active Companies</Typography>
            <Typography variant="h3">{stats.activeCompanies}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper 
            sx={{ 
              p: 3, 
              textAlign: 'center', 
              bgcolor: 'info.light', 
              color: 'white',
              height: '100%'
            }}
          >
            <Typography variant="h6">Total Users</Typography>
            <Typography variant="h3">{stats.totalUsers}</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Companies Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Company Name</TableCell>
              <TableCell>Admin</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created Date</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {companies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No companies found
                </TableCell>
              </TableRow>
            ) : (
              companies.map((company) => (
                <TableRow key={company._id}>
                  <TableCell>{company.name}</TableCell>
                  <TableCell>
                    {company.admin?.name || (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleCreateAdmin(company)}
                      >
                        Add Admin
                      </Button>
                    )}
                  </TableCell>
                  <TableCell>{company.description}</TableCell>
                  <TableCell>
                    <Typography
                      color={company.active ? 'success.main' : 'error.main'}
                    >
                      {company.active ? 'Active' : 'Inactive'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {new Date(company.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="View Details">
                      <IconButton
                        color="primary"
                        onClick={() => handleViewCompany(company._id)}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    {!company.admin && (
                      <Tooltip title="Add Admin">
                        <IconButton
                          color="secondary"
                          onClick={() => handleCreateAdmin(company)}
                        >
                          <PersonAddIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modified Create Company Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Company with Admin</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Company Details
            </Typography>
            <TextField
              margin="dense"
              label="Company Name"
              fullWidth
              required
              value={newCompany.name}
              onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
            />
            <TextField
              margin="dense"
              label="Description"
              fullWidth
              multiline
              rows={4}
              value={newCompany.description}
              onChange={(e) => setNewCompany({ ...newCompany, description: e.target.value })}
            />

            <Typography variant="h6" sx={{ mt: 3 }} gutterBottom>
              Admin Details
            </Typography>
            <TextField
              margin="dense"
              label="Admin Name"
              fullWidth
              required
              value={newCompany.admin.name}
              onChange={(e) => setNewCompany({
                ...newCompany,
                admin: { ...newCompany.admin, name: e.target.value }
              })}
            />
            <TextField
              margin="dense"
              label="Admin Email"
              type="email"
              fullWidth
              required
              value={newCompany.admin.email}
              onChange={(e) => setNewCompany({
                ...newCompany,
                admin: { ...newCompany.admin, email: e.target.value }
              })}
            />
            <TextField
              margin="dense"
              label="Admin Password"
              type="password"
              fullWidth
              required
              value={newCompany.admin.password}
              onChange={(e) => setNewCompany({
                ...newCompany,
                admin: { ...newCompany.admin, password: e.target.value }
              })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateCompany} 
            variant="contained"
            disabled={
              !newCompany.name.trim() ||
              !newCompany.admin.name.trim() ||
              !newCompany.admin.email.trim() ||
              !newCompany.admin.password.trim()
            }
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Company Admin Dialog */}
      <CreateCompanyAdmin
        open={openAdminDialog}
        handleClose={() => setOpenAdminDialog(false)}
        companyId={selectedCompany?._id}
        companyName={selectedCompany?.name}
        onAdminCreated={handleAdminCreated}
      />
    </Container>
  );
};

export default SuperAdminDashboard;