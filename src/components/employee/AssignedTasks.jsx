import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  CircularProgress,
  Alert,
  Typography,
} from '@mui/material';
import { tasks } from '../../services/api';
import TaskCard from './TaskCard';
import TaskView from './TaskView';

const AssignedTasks = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [taskList, setTaskList] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [viewTaskDialog, setViewTaskDialog] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await tasks.getAssignedTasks();
      
      if (!response?.data) {
        throw new Error('No data received from server');
      }

      setTaskList(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError(
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch tasks'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setViewTaskDialog(true);
  };

//   if (loading) {
//     return (
//       <Box display="flex" justifyContent="center" p={3}>
//         <CircularProgress />
//       </Box>
//     );
//   }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <>
    <Typography variant="h4" ml={4} mt={10}>Recieved Tasks</Typography>
      <Grid container spacing={2} paddingLeft={2} marginTop={2}>
        {taskList.map((task) => (
          <Grid item xs={12} md={6} key={task._id}>
            <TaskCard
              task={task}
              onClick={() => handleTaskClick(task)}
            />
          </Grid>
        ))}
      </Grid>
      <TaskView
        taskId={selectedTask?._id}
        open={viewTaskDialog}
        onClose={() => {
          setViewTaskDialog(false);
          setSelectedTask(null);
        }}
        onUpdate={fetchTasks}
      />
    </>
  );
};

export default AssignedTasks;