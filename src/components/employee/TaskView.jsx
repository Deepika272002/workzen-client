import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  Chip,
  Divider,
  TextField,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import { format } from 'date-fns';
import { tasks } from '../../services/api';

const TaskView = ({ taskId, open, onClose, onUpdate }) => {
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (taskId && open) {
      fetchTaskDetails();
    }
  }, [taskId, open]);

  const fetchTaskDetails = async () => {
    try {
      setLoading(true);
      const response = await tasks.getById(taskId);
      setTask(response.data);
    } catch (error) {
      setError('Failed to fetch task details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await tasks.updateStatus(taskId, newStatus);
      fetchTaskDetails();
      if (onUpdate) onUpdate();
    } catch (error) {
      setError('Failed to update task status');
    }
  };

  const handleAddComment = async () => {
    try {
      await tasks.addComment(taskId, comment);
      setComment('');
      fetchTaskDetails();
    } catch (error) {
      setError('Failed to add comment');
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h6">{task?.title}</Typography>
        <Chip 
          label={task?.status} 
          color={task?.status === 'completed' ? 'success' : 'default'}
          size="small"
          sx={{ ml: 1 }}
        />
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <Typography variant="body1">{task?.description}</Typography>
          <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
            <Chip label={`Priority: ${task?.priority}`} size="small" />
            <Chip 
              label={`Due: ${task?.dueDate ? format(new Date(task.dueDate), 'PPP') : 'No due date'}`} 
              size="small" 
            />
          </Box>
        </Box>
        <Box display="flex" flexDirection="column" mt={2}>
          <Typography variant="body2">
            Assigned By: {task.assignedByName}
          </Typography>
          <Typography variant="body2">
            Assigned To: {task.assignedToName}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Status Update */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>Update Status</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button 
              variant="outlined" 
              size="small"
              onClick={() => handleStatusChange('pending')}
            >
              Pending
            </Button>
            <Button 
              variant="outlined" 
              size="small"
              onClick={() => handleStatusChange('in_progress')}
            >
              In Progress
            </Button>
            <Button 
              variant="outlined" 
              size="small"
              onClick={() => handleStatusChange('completed')}
            >
              Completed
            </Button>
          </Box>
        </Box>

        {/* Comments Section */}
        <Box>
          <Typography variant="subtitle1" gutterBottom>Comments</Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment..."
            sx={{ mb: 1 }}
          />
          <Button 
            variant="contained" 
            onClick={handleAddComment}
            disabled={!comment.trim()}
          >
            Add Comment
          </Button>

          {/* Comments List */}
          <Box sx={{ mt: 2 }}>
            {task?.comments?.map((comment, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <Typography variant="subtitle2">
                  {comment.user.name} - {comment.createdAt ? format(new Date(comment.createdAt), 'PPP') : 'No date'}
                </Typography>
                <Typography variant="body2">{comment.content}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default TaskView; 