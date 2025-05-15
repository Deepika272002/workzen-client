import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Assignment as TaskIcon,
  People as TeamIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import { useAuth } from '../../Context/AuthContext';
import api from '../../services/api';
import TaskList from './TaskList';
import CreateTask from './CreateTask';
import TaskTimeline from './TaskTimeline';
import TeamMembers from '../companyadmin/TeamMembers';
import { useNavigate} from 'react-router-dom';
import {users} from '../../services/api';
// import MyTasks from './MyTasks';

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('tasks');
  const [stats, setStats] = useState({
    assignedTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    teamMembers: 0,
  });
  const [openCreateTask, setOpenCreateTask] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    fetchTeamMembersCount();
  }, []);

  const navigate = useNavigate();
  const fetchTeamMembersCount = async () => {
    try {
      const response = await users.getMyTeam();
      const teamMembersCount = response.data.length || 0;
      setStats(prevStats => ({
        ...prevStats,
        teamMembers: teamMembersCount
      }));
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const tasksRes = await api.get('/tasks/my-stats');
      
      // Log the response to debug
      // console.log('Task stats response:', tasksRes.data);

      // Make sure we're accessing the correct data structure
      const stats = tasksRes.data.data || tasksRes.data;
      
      setStats(prevStats => ({
        ...prevStats,
        assignedTasks: stats.totalTasks || 0,
        completedTasks: stats.completedTasks || 0,
        pendingTasks: stats.pendingTasks || 0,
        inProgressTasks: stats.inProgressTasks || 0
      }));

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(error.response?.data?.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Add this function to handle task status updates
  const handleTaskStatusUpdate = (updatedStats) => {
    setStats(prevStats => ({
      ...prevStats,
      assignedTasks: updatedStats.totalTasks || prevStats.assignedTasks,
      completedTasks: updatedStats.completedTasks || prevStats.completedTasks,
      pendingTasks: updatedStats.pendingTasks || prevStats.pendingTasks,
      inProgressTasks: updatedStats.inProgressTasks || prevStats.inProgressTasks
    }));
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
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

      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Employee Dashboard</Typography>
      
          <Button
            variant="contained"
            color="primary"
            onClick={() => setOpenCreateTask(true)}
          >
            Create Task
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/my-tasks')}
            sx={{ mr: 2 }}
          >
            Team Tasks
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/assigned-tasks')}
          >
            Received Tasks
          </Button>
      
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={6} sm={4} md={2}>
          <Paper sx={{ p: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="h6">Total Tasks</Typography>
            <Typography variant="h4">{stats.assignedTasks}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <Paper sx={{ p: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="h6">Assigned Tasks</Typography>
            <Typography variant="h4">{stats.assignedTasks}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <Paper sx={{ p: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="h6">Pending Tasks</Typography>
            <Typography variant="h4">{stats.pendingTasks}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <Paper sx={{ p: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="h6">Completed</Typography>
            <Typography variant="h4">{stats.completedTasks}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <Paper sx={{ p: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="h6">In Progress</Typography>
            <Typography variant="h4">{stats.inProgressTasks}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <Paper sx={{ p: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="h6">Team Members</Typography>
            <Typography variant="h4">{stats.teamMembers}</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Navigation Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label="My Tasks" value="tasks" icon={<TaskIcon />} />
          {user?.canAssignTasks && (
            <Tab label="Team" value="team" icon={<TeamIcon />} />
          )}
          {/* <Tab label="Timeline" value="timeline" icon={<TimelineIcon />} /> */}
        </Tabs>
      </Box>

      {/* Content Area */}
      {activeTab === 'tasks' && <TaskList onStatusUpdate={handleTaskStatusUpdate} />}
      {activeTab === 'team' && user?.canAssignTasks && <TeamMembers />}
      {activeTab === 'timeline' && <TaskTimeline />}

      {/* Create Task Dialog */}
      <CreateTask
        open={openCreateTask}
        onClose={() => setOpenCreateTask(false)}
        onTaskCreated={fetchDashboardData}
      />
    </Container>
  );
};

export default EmployeeDashboard;