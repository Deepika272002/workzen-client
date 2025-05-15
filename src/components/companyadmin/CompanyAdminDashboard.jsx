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
} from '@mui/material';
import {
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import { useAuth } from '../../Context/AuthContext';

import EmployeesList from '../companyadmin/EmployeesList';
import TasksList from '../employee/TaskList';
import HierarchyManagement from './HierarchyManagement';
import { companies, users, hierarchy, tasks } from '../../services/api';

const CompanyAdminDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    inProgressTasks: 0,
    hierarchyLevels: 0,
    tasksByPriority: {},
    completionRate: 0,
    recentTasks: [],
  });
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [employeesRes, tasksRes, hierarchyRes] = await Promise.all([
        users.getEmployees().catch(() => ({ data: [] })),
        tasks.getAnalytics().catch(() => ({
          data: {
            totalTasks: 0,
            completedTasks: 0,
            pendingTasks: 0,
            inProgressTasks: 0,
            tasksByPriority: { low: 0, medium: 0, high: 0 },
            completionRate: 0,
            recentTasks: []
          }
        })),
        hierarchy.getAll().catch(() => ({ data: [] }))
      ]);

      setStats({
        totalEmployees: employeesRes?.data?.length || 0,
        totalTasks: tasksRes?.data?.totalTasks || 0,
        completedTasks: tasksRes?.data?.completedTasks || 0,
        pendingTasks: tasksRes?.data?.pendingTasks || 0,
        inProgressTasks: tasksRes?.data?.inProgressTasks || 0,
        hierarchyLevels: hierarchyRes?.data?.length || 0,
        tasksByPriority: tasksRes?.data?.tasksByPriority || { low: 0, medium: 0, high: 0 },
        completionRate: tasksRes?.data?.completionRate || 0,
        recentTasks: tasksRes?.data?.recentTasks || []
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Unable to fetch some dashboard data. Showing available information.');
      
      // Set default values even if there's an error
      setStats(prevStats => ({
        ...prevStats,
        totalEmployees: 0,
        totalTasks: 0,
        completedTasks: 0,
        pendingTasks: 0,
        inProgressTasks: 0,
        hierarchyLevels: 0,
        tasksByPriority: { low: 0, medium: 0, high: 0 },
        completionRate: 0,
        recentTasks: []
      }));
    } finally {
      setLoading(false);
    }
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
        <Alert severity="warning" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Typography variant="h4" gutterBottom>
        Company Admin Dashboard
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              bgcolor: 'primary.light',
              color: 'white',
            }}
          >
            <PeopleIcon sx={{ fontSize: 40 }} />
            <Typography variant="h6">Employees</Typography>
            <Typography variant="h4">{stats.totalEmployees}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              bgcolor: 'success.light',
              color: 'white',
            }}
          >
            <AssignmentIcon sx={{ fontSize: 40 }} />
            <Typography variant="h6">Total Tasks</Typography>
            <Typography variant="h4">{stats.totalTasks}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              bgcolor: 'info.light',
              color: 'white',
            }}
          >
            <AssignmentIcon sx={{ fontSize: 40 }} />
            <Typography variant="h6">Completed Tasks</Typography>
            <Typography variant="h4">{stats.completedTasks}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              bgcolor: 'warning.light',
              color: 'white',
            }}
          >
            {/* <TimelineIcon sx={{ fontSize: 40 }} /> */}
            <Typography variant="h6">Hierarchy Levels</Typography>
            <Typography variant="h4">{stats.hierarchyLevels}</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Navigation Tabs */}
      <Box sx={{ mb: 3 }}>
        <Button
          variant={activeTab === 'overview' ? 'contained' : 'outlined'}
          onClick={() => setActiveTab('overview')}
          sx={{ mr: 1 }}
        >
          Overview
        </Button>
        <Button
          variant={activeTab === 'employees' ? 'contained' : 'outlined'}
          onClick={() => setActiveTab('employees')}
          sx={{ mr: 1 }}
        >
          Employees
        </Button>
        <Button
          variant={activeTab === 'tasks' ? 'contained' : 'outlined'}
          onClick={() => setActiveTab('tasks')}
          sx={{ mr: 1 }}
        >
          Tasks
        </Button>
        <Button
          variant={activeTab === 'hierarchy' ? 'contained' : 'outlined'}
          onClick={() => setActiveTab('hierarchy')}
        >
          Hierarchy
        </Button>
      </Box>

      {/* Content Area */}
      <Box>
        {activeTab === 'employees' && <EmployeesList />}
        {activeTab === 'tasks' && <TasksList />}
        {activeTab === 'hierarchy' && <HierarchyManagement />}
        {activeTab === 'overview' && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Recent Activities
                </Typography>
                {/* Add recent activities component here */}
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Task Progress
                </Typography>
                {/* Add task progress component here */}
              </Paper>
            </Grid>
          </Grid>
        )}
      </Box>

      {/* Add a message when no data is available */}
      {!loading && !stats.totalTasks && !stats.totalEmployees && (
        <Alert severity="info" sx={{ mt: 2 }}>
          No data available yet. Start by adding employees and creating tasks.
        </Alert>
      )}
    </Container>
  );
};

export default CompanyAdminDashboard; 