import { useState, useEffect } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Tooltip,
  Avatar,
} from '@mui/material';
import {
  Assignment as TaskIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
// import api from '../../services/api';
import { useAuth } from '../../Context/AuthContext';
import { canAssignTaskTo } from '../../utils/hierarchyHelper';
// import { userService } from '../../services/userService';
import { users } from '../../services/api';


const TeamMembers = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      const response = await users.getCompanyEmployees();
      
      // Filter out members based on hierarchy level
      const filteredMembers = response.data.filter(member => {
        if (!user.hierarchyLevel || !member.hierarchyLevel) return false;
        return user.hierarchyLevel.level < member.hierarchyLevel.level;
      });

      setTeamMembers(filteredMembers);
    } catch (error) {
      console.error('Error fetching team members:', error);
      setError(error.response?.data?.message || 'Failed to fetch team members');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Employee</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Department</TableCell>
            <TableCell>Active Tasks</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {teamMembers.map((member) => (
            <TableRow key={member._id}>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ mr: 2 }}>{member.name[0]}</Avatar>
                  <Box>
                    <Typography variant="subtitle2">{member.name}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {member.email}
                    </Typography>
                  </Box>
                </Box>
              </TableCell>
              <TableCell>
                <Chip
                  label={member.hierarchyLevel?.name || 'N/A'}
                  size="small"
                />
              </TableCell>
              <TableCell>
                {member.hierarchyLevel?.departmentScope?.map((dept) => (
                  <Chip
                    key={dept}
                    label={dept}
                    size="small"
                    sx={{ mr: 0.5 }}
                  />
                ))}
              </TableCell>
              <TableCell>
                <Chip
                  label={member.activeTasks || 0}
                  color={member.activeTasks > 0 ? 'primary' : 'default'}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <Tooltip title="Assign Task">
                  <IconButton 
                    size="small"
                    onClick={() => handleAssignTask(member)}
                    disabled={!canAssignTaskTo(user.hierarchyLevel?.level, member.hierarchyLevel?.level)}
                  >
                    <TaskIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Send Email">
                  <IconButton size="small">
                    <EmailIcon />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TeamMembers; 