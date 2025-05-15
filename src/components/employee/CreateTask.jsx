import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { CloudUpload as UploadIcon } from '@mui/icons-material';
import { users, tasks } from '../../services/api';
import { useAuth } from '../../Context/AuthContext';
import { canAssignTaskTo } from '../../utils/hierarchyHelper';
import dayjs from 'dayjs';

const CreateTask = ({ open, onClose, onTaskCreated }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    dueDate: dayjs(),
    priority: 'medium',
    category: '',
    estimatedHours: '',
    attachments: [],
    subtasks: [],
    reviewers: [],
  });

  useEffect(() => {
    if (open) {
      fetchTeamMembers();
      // Reset form when dialog opens
      setFormData({
        title: '',
        description: '',
        assignedTo: '',
        dueDate: dayjs(),
        priority: 'medium',
        category: '',
        estimatedHours: '',
        attachments: [],
        subtasks: [],
        reviewers: [],
      });
      setError(null);
      setSuccess(false);
    }
  }, [open]);

  const fetchTeamMembers = async () => {
    try {
      const response = await users.getMyTeam();
      const assignableMembers = response.data.filter(member => {
        if (!user.hierarchyLevel || !member.hierarchyLevelData) return false;
        return user.hierarchyLevel.level < member.hierarchyLevelData.level;
      });
      setTeamMembers(assignableMembers);
    } catch (error) {
      console.error('Error fetching team members:', error);
      setError('Failed to fetch team members');
    }
  };

  const handleFileChange = (event) => {
    setFormData({
      ...formData,
      attachments: [...event.target.files],
    });
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Title is required');
      return false;
    }
    if (!formData.description.trim()) {
      setError('Description is required');
      return false;
    }
    if (!formData.assignedTo) {
      setError('You must assign the task to someone');
      return false;
    }
    if (!formData.category.trim()) {
      setError('Category is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      // Create FormData object for file upload
      const taskFormData = new FormData();
      
      // Add basic task data
      taskFormData.append('title', formData.title);
      taskFormData.append('description', formData.description);
      taskFormData.append('assignedTo', formData.assignedTo);
      taskFormData.append('dueDate', formData.dueDate.toISOString());
      taskFormData.append('priority', formData.priority);
      taskFormData.append('category', formData.category);
      
      // Only add estimatedHours if it's not empty
      if (formData.estimatedHours) {
        taskFormData.append('estimatedHours', formData.estimatedHours);
      }

      // Add attachments if any
      if (formData.attachments.length > 0) {
        formData.attachments.forEach(file => {
          taskFormData.append('attachments', file);
        });
      }

      // Add any subtasks or reviewers if needed
      if (formData.subtasks.length > 0) {
        taskFormData.append('subtasks', JSON.stringify(formData.subtasks));
      }
      if (formData.reviewers.length > 0) {
        taskFormData.append('reviewers', JSON.stringify(formData.reviewers));
      }

      const response = await tasks.create(taskFormData);

      setSuccess(true);
      if (onTaskCreated) onTaskCreated();
      
      // Close the dialog after a short delay
      setTimeout(() => {
        onClose();
      }, 1000);
      
    } catch (error) {
      console.error('Error creating task:', error);
      
      // Check if the task was actually created despite the error
      if (error.response?.data?.status === 'success' || 
          error.response?.data?.warning?.includes('Task created but')) {
        setSuccess(true);
        if (onTaskCreated) onTaskCreated();
        
        // Show a warning instead of an error
        setError('Task created successfully, but notification delivery failed.');
        
        // Close the dialog after a short delay
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setError(error.response?.data?.message || 'Failed to create task. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Create New Task</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Task created successfully!
          </Alert>
        )}

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <TextField
            margin="dense"
            label="Title"
            fullWidth
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />

          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          <FormControl fullWidth margin="dense">
            <InputLabel>Assign To</InputLabel>
            <Select
              value={formData.assignedTo}
              onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
            >
              {teamMembers.map((member) => (
                <MenuItem 
                  key={member._id} 
                  value={member._id}
                  disabled={!canAssignTaskTo(user.hierarchyLevel?.level, member.hierarchyLevelData?.level)}
                >
                  {member.name} ({member.hierarchyLevelData?.name || 'N/A'})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <DateTimePicker
            label="Due Date"
            value={formData.dueDate}
            onChange={(newValue) => setFormData({ ...formData, dueDate: newValue })}
            slotProps={{ textField: { fullWidth: true, margin: 'dense' } }}
          />

          <FormControl fullWidth margin="dense">
            <InputLabel>Priority</InputLabel>
            <Select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            >
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
            </Select>
          </FormControl>

          <TextField
            margin="dense"
            label="Category"
            fullWidth
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          />

          <TextField
            margin="dense"
            label="Estimated Hours"
            type="number"
            fullWidth
            value={formData.estimatedHours}
            onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value })}
          />

          <Box sx={{ mt: 2 }}>
            <input
              accept="*/*"
              style={{ display: 'none' }}
              id="task-attachments"
              multiple
              type="file"
              onChange={handleFileChange}
            />
            <label htmlFor="task-attachments">
              <Button
                variant="outlined"
                component="span"
                startIcon={<UploadIcon />}
              >
                Upload Attachments
              </Button>
            </label>
            <Box sx={{ mt: 1 }}>
              {formData.attachments.map((file, index) => (
                <Chip
                  key={index}
                  label={file.name}
                  onDelete={() => {
                    const newFiles = [...formData.attachments];
                    newFiles.splice(index, 1);
                    setFormData({ ...formData, attachments: newFiles });
                  }}
                  sx={{ mr: 1, mb: 1 }}
                />
              ))}
            </Box>
          </Box>
        </LocalizationProvider>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !formData.title || !formData.assignedTo}
        >
          {loading ? <CircularProgress size={24} /> : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateTask;