import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Divider,
  Chip,
  CircularProgress,
  Alert,
  TextField,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import api from '../../services/api';

const TaskTimeline = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeline, setTimeline] = useState({});
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  useEffect(() => {
    fetchTimeline();
  }, [selectedMonth]);

  const fetchTimeline = async () => {
    try {
      setLoading(true);
      const start = startOfMonth(selectedMonth);
      const end = endOfMonth(selectedMonth);

      const response = await api.get('/tasks/timeline', {
        params: {
          startDate: start.toISOString(),
          endDate: end.toISOString(),
        },
      });

      setTimeline(response.data);
    } catch (error) {
      console.error('Error fetching timeline:', error);
      setError(error.response?.data?.message || 'Failed to fetch timeline');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return '#f44336';
      case 'medium':
        return '#ff9800';
      case 'low':
        return '#4caf50';
      default:
        return '#757575';
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
    <Box>
      <Box sx={{ mb: 3 }}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            views={['month', 'year']}
            label="Select Month"
            value={selectedMonth}
            onChange={(newValue) => setSelectedMonth(newValue)}
            slotProps={{ textField: { helperText: null } }}
          />
        </LocalizationProvider>
      </Box>

      {Object.entries(timeline).map(([date, tasks]) => (
        <Paper key={date} sx={{ mb: 2, p: 2 }}>
          <Typography variant="h6" gutterBottom>
            {format(new Date(date), 'MMMM dd, yyyy')}
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          {tasks.map((task) => (
            <Box
              key={task._id}
              sx={{
                mb: 2,
                pl: 2,
                borderLeft: `4px solid ${getPriorityColor(task.priority)}`,
              }}
            >
              <Typography variant="subtitle1">{task.title}</Typography>
              <Box sx={{ mt: 1 }}>
                <Chip
                  label={task.status}
                  size="small"
                  color={task.status === 'completed' ? 'success' : 'default'}
                  sx={{ mr: 1 }}
                />
                <Chip
                  label={task.priority}
                  size="small"
                  sx={{
                    mr: 1,
                    bgcolor: getPriorityColor(task.priority),
                    color: 'white',
                  }}
                />
                <Typography variant="body2" color="textSecondary" component="span">
                  Due: {format(new Date(task.dueDate), 'HH:mm')}
                </Typography>
              </Box>
            </Box>
          ))}
        </Paper>
      ))}

      {Object.keys(timeline).length === 0 && (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="textSecondary">
            No tasks scheduled for this month
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default TaskTimeline;