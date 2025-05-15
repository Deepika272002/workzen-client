import { useState, useEffect } from "react";
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
  Box,
  Grid,
  DialogContentText,
  Snackbar,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import { users, hierarchy } from "../../services/api";
import { LoadingButton } from '@mui/lab';

const EmployeesList = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [hierarchyLevels, setHierarchyLevels] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    hierarchyLevel: "",
    reportsTo: "",
    role: "employee",
    bio: "",
    active: true,
  });
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchEmployees();
    fetchHierarchyLevels();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await users.getEmployees();
      setEmployees(response.data);
      console.log(response.data);
    } catch (error) {
      console.error("Error fetching employees:", error);
      setError("Failed to fetch employees");
    } finally {
      setLoading(false);
    }
  };

  const fetchHierarchyLevels = async () => {
    try {
      const response = await hierarchy.getAll();
      setHierarchyLevels(response.data);
    } catch (error) {
      console.error("Error fetching hierarchy levels:", error);
    }
  };

  const handleCreateEmployee = async () => {
    try {
      setError(null);

      // Validate phone number
      const phoneNumber = formData.phone.replace(/[^0-9]/g, "");
      if (phoneNumber.length < 6) {
        setError("Phone number must be at least 6 digits");
        return;
      }

      const response = await users.addEmployee({
        ...formData,
        phone: phoneNumber,
        reportsTo: formData.reportsTo || null,
        password: phoneNumber,
      });

      setEmployees([...employees, response.data.employee]);
      setOpenDialog(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        hierarchyLevel: "",
        reportsTo: "",
        role: "employee",
        bio: "",
        active: true,
      });

      // Show the initial password to admin
      alert(
        `Employee created successfully! Initial password: ${response.data.initialPassword}`
      );
    } catch (error) {
      console.error("Error creating employee:", error);
      setError(error.response?.data?.message || "Failed to create employee");
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleEditClick = (employee) => {
    setSelectedEmployee(employee);
    setFormData({
      name: employee.name,
      email: employee.email,
      phone: employee.phone,
      hierarchyLevel: employee.hierarchyLevel?._id || "",
      reportsTo: employee.reportsTo?._id || "",
      role: employee.role,
      bio: employee.bio || "",
      active: employee.active,
    });
    setOpenEditDialog(true);
  };

  const handleDeleteClick = (employee) => {
    setSelectedEmployee(employee);
    setOpenDeleteDialog(true);
  };

  const handleUpdateEmployee = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      const phoneNumber = formData.phone.replace(/[^0-9]/g, "");
      if (phoneNumber.length < 6) {
        setError("Phone number must be at least 6 digits");
        return;
      }

      await users.updateEmployee(selectedEmployee._id, {
        ...formData,
        phone: phoneNumber,
        reportsTo: formData.reportsTo || null,
      });

      setSnackbar({
        open: true,
        message: 'Employee updated successfully',
        severity: 'success'
      });
      
      setOpenEditDialog(false);
      fetchEmployees();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update employee");
      setSnackbar({
        open: true,
        message: 'Failed to update employee',
        severity: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEmployee = async () => {
    try {
      setIsSubmitting(true);
      await users.deleteUser(selectedEmployee._id);
      
      setSnackbar({
        open: true,
        message: 'Employee deleted successfully',
        severity: 'success'
      });
      
      setOpenDeleteDialog(false);
      fetchEmployees();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to delete employee");
      setSnackbar({
        open: true,
        message: 'Failed to delete employee',
        severity: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Box>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Employees
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{ float: "right" }}
            onClick={() => setOpenDialog(true)}
          >
            Add Employee
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
                <TableCell>Email</TableCell>
                <TableCell>Hierarchy Level</TableCell>
                <TableCell>Reports To</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee._id}>
                  <TableCell>{employee.name}</TableCell>
                  <TableCell>{employee.email}</TableCell>
                  <TableCell>{employee.hierarchyLevel?.name}</TableCell>
                  <TableCell>{employee.reportsTo?.name}</TableCell>
                  <TableCell>
                    <IconButton 
                      color="primary"
                      onClick={() => handleEditClick(employee)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      color="error"
                      onClick={() => handleDeleteClick(employee)}
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
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Employee</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                name="name"
                label="Full Name"
                fullWidth
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="email"
                label="Email"
                type="email"
                fullWidth
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="phone"
                label="Phone Number"
                fullWidth
                value={formData.phone}
                onChange={handleInputChange}
                required
                helperText="This will be used as the initial password"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="hierarchyLevel"
                label="Hierarchy Level"
                select
                fullWidth
                value={formData.hierarchyLevel}
                onChange={handleInputChange}
                required
              >
                {hierarchyLevels.map((level) => (
                  <MenuItem key={level._id} value={level._id}>
                    {level.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="reportsTo"
                label="Reports To"
                select
                fullWidth
                value={formData.reportsTo}
                onChange={handleInputChange}
              >
                <MenuItem value="">None</MenuItem>
                {employees.map((emp) => (
                  <MenuItem key={emp._id} value={emp._id}>
                    {emp.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="bio"
                label="Bio"
                multiline
                rows={3}
                fullWidth
                value={formData.bio}
                onChange={handleInputChange}
                helperText="Brief description about the employee"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <LoadingButton
            onClick={handleUpdateEmployee}
            loading={isSubmitting}
            variant="contained"
            disabled={
              !formData.name ||
              !formData.email ||
              !formData.phone ||
              !formData.hierarchyLevel
            }
          >
            Update
          </LoadingButton>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Delete Employee</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete {selectedEmployee?.name}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <LoadingButton
            onClick={handleDeleteEmployee}
            loading={isSubmitting}
            color="error"
            variant="contained"
          >
            Delete
          </LoadingButton>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add New Employee</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                name="name"
                label="Full Name"
                fullWidth
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="email"
                label="Email"
                type="email"
                fullWidth
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="phone"
                label="Phone Number"
                fullWidth
                value={formData.phone}
                onChange={handleInputChange}
                required
                helperText="This will be used as the initial password"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="hierarchyLevel"
                label="Hierarchy Level"
                select
                fullWidth
                value={formData.hierarchyLevel}
                onChange={handleInputChange}
                required
              >
                {hierarchyLevels.map((level) => (
                  <MenuItem key={level._id} value={level._id}>
                    {level.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="reportsTo"
                label="Reports To"
                select
                fullWidth
                value={formData.reportsTo}
                onChange={handleInputChange}
              >
                <MenuItem value="">None</MenuItem>
                {employees.map((emp) => (
                  <MenuItem key={emp._id} value={emp._id}>
                    {emp.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="bio"
                label="Bio"
                multiline
                rows={3}
                fullWidth
                value={formData.bio}
                onChange={handleInputChange}
                helperText="Brief description about the employee"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={handleCreateEmployee}
            variant="contained"
            disabled={
              !formData.name ||
              !formData.email ||
              !formData.phone ||
              !formData.hierarchyLevel
            }
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmployeesList;