import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from '@mui/material';
import { tasks } from '../../services/api';
import TaskCard from './TaskCard';
import TaskView from './TaskView';

const TaskList = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [taskList, setTaskList] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [viewTaskDialog, setViewTaskDialog] = useState(false);
  const [editTaskDialog, setEditTaskDialog] = useState(false);
  const [editTaskData, setEditTaskData] = useState({});

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await tasks.getMyTasks();
      
      if (!response?.data) {
        throw new Error('No data received from server');
      }

      if (response.data.status === 'error') {
        throw new Error(response.data.message);
      }

      setTaskList(response.data.data || []);
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

  const handleEditTask = (task) => {
    setEditTaskData(task);
    setEditTaskDialog(true);
  };

  const handleDeleteTask = async (task) => {
    try {
      await tasks.delete(task._id);
      fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleUpdateTask = async () => {
    try {
      await tasks.update(editTaskData._id, editTaskData);
      setEditTaskDialog(false);
      fetchTasks();
    } catch (error) {
      console.error('Error updating task:', error);
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
    <>
      <Grid container spacing={3}>
        {taskList.map((task) => (
          <Grid item xs={12} md={6} key={task._id}>
            <TaskCard
              task={task}
              onClick={() => handleTaskClick(task)}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
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

      <Dialog open={editTaskDialog} onClose={() => setEditTaskDialog(false)}>
        <DialogTitle>Edit Task</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Title"
            fullWidth
            value={editTaskData.title || ''}
            onChange={(e) => setEditTaskData({ ...editTaskData, title: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={4}
            value={editTaskData.description || ''}
            onChange={(e) => setEditTaskData({ ...editTaskData, description: e.target.value })}
          />
          {/* Add more fields as necessary */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditTaskDialog(false)}>Cancel</Button>
          <Button onClick={handleUpdateTask} variant="contained">
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TaskList; 