import { useState, useEffect } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  CircularProgress,
  Switch,
  FormControlLabel,
  Box,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
// import { hierarchyService } from '../../services/hierarchyService';
import { hierarchy } from '../../services/api';

const HierarchyManagement = () => {
  const [hierarchyLevels, setHierarchyLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    level: '',
    canAssignTasks: false,
    maxTasksPerDay: 10,
    departmentScope: [],
    reportsTo: '',
    permissions: {
      canCreateTasks: false,
      canAssignTasks: false,
      canEditTasks: false,
      canDeleteTasks: false,
      canViewReports: false,
      canManageUsers: false,
    },
  });

  const departments = [
    'IT',
    'HR',
    'Finance',
    'Operations',
    'Marketing',
    'Sales'
  ];

  useEffect(() => {
    fetchHierarchyLevels();
  }, []);

  const fetchHierarchyLevels = async () => {
    try {
      const response = await hierarchy.getAll();
      setHierarchyLevels(response.data);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch hierarchy levels');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateHierarchy = async () => {
    try {
      await hierarchy.create(formData);
      setOpenDialog(false);
      fetchHierarchyLevels();
      setFormData({
        name: '',
        level: '',
        canAssignTasks: false,
        maxTasksPerDay: 10,
        departmentScope: [],
        reportsTo: '',
        permissions: {
          canCreateTasks: false,
          canAssignTasks: false,
          canEditTasks: false,
          canDeleteTasks: false,
          canViewReports: false,
          canManageUsers: false,
        },
      });
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create hierarchy level');
    }
  };

  const handleDeleteHierarchy = async (id) => {
    try {
      await hierarchy.updateHierarchyLevel(id, { active: false });
      fetchHierarchyLevels();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete hierarchy level');
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Hierarchy Levels
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{ float: 'right' }}
            onClick={() => setOpenDialog(true)}
          >
            Add Level
          </Button>
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Level</TableCell>
                <TableCell>Can Assign Tasks</TableCell>
                <TableCell>Max Tasks Per Day</TableCell>
                <TableCell>Department Scope</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {hierarchyLevels.map((level) => (
                <TableRow key={level._id}>
                  <TableCell>{level.name}</TableCell>
                  <TableCell>{level.level}</TableCell>
                  <TableCell>{level.canAssignTasks ? 'Yes' : 'No'}</TableCell>
                  <TableCell>{level.maxTasksPerDay}</TableCell>
                  <TableCell>
                    {level.departmentScope?.join(', ') || 'All Departments'}
                  </TableCell>
                  <TableCell>
                    <IconButton color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      color="error"
                      onClick={() => handleDeleteHierarchy(level._id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Hierarchy Level</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Level Name"
            fullWidth
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Level Number"
            type="number"
            fullWidth
            value={formData.level}
            onChange={(e) => setFormData({ ...formData, level: e.target.value })}
          />
          <FormControlLabel
            control={
              <Switch
                checked={formData.canAssignTasks}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  canAssignTasks: e.target.checked 
                })}
              />
            }
            label="Can Assign Tasks"
          />
          <TextField
            margin="dense"
            label="Max Tasks Per Day"
            type="number"
            fullWidth
            value={formData.maxTasksPerDay}
            onChange={(e) => setFormData({ 
              ...formData, 
              maxTasksPerDay: e.target.value 
            })}
          />
          <TextField
            select
            margin="dense"
            label="Department Scope"
            fullWidth
            SelectProps={{
              multiple: true
            }}
            value={formData.departmentScope}
            onChange={(e) => setFormData({ 
              ...formData, 
              departmentScope: e.target.value 
            })}
          >
            {departments.map((dept) => (
              <MenuItem key={dept} value={dept}>
                {dept}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            margin="dense"
            label="Reports To"
            fullWidth
            value={formData.reportsTo}
            onChange={(e) => setFormData({ ...formData, reportsTo: e.target.value })}
          />
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1">Permissions</Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.permissions.canCreateTasks}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    permissions: { 
                      ...formData.permissions, 
                      canCreateTasks: e.target.checked 
                    } 
                  })}
                />
              }
              label="Can Create Tasks"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.permissions.canEditTasks}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    permissions: { 
                      ...formData.permissions, 
                      canEditTasks: e.target.checked 
                    } 
                  })}
                />
              }
              label="Can Edit Tasks"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.permissions.canDeleteTasks}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    permissions: { 
                      ...formData.permissions, 
                      canDeleteTasks: e.target.checked 
                    } 
                  })}
                />
              }
              label="Can Delete Tasks"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.permissions.canViewReports}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    permissions: { 
                      ...formData.permissions, 
                      canViewReports: e.target.checked 
                    } 
                  })}
                />
              }
              label="Can View Reports"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.permissions.canManageUsers}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    permissions: { 
                      ...formData.permissions, 
                      canManageUsers: e.target.checked 
                    } 
                  })}
                />
              }
              label="Can Manage Users"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateHierarchy} 
            variant="contained"
            disabled={!formData.name || !formData.level}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default HierarchyManagement;