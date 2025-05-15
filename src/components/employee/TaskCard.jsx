import { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Button,
} from "@mui/material";
import {
  MoreVert as MoreVertIcon,
  CommentBankTwoTone as CommentIcon,
  Chat as ChatIcon,
  AccessTime as TimeIcon,
  Assignment as TaskIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ChatTwoTone as ChatTwoToneIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import { useAuth } from "../../Context/AuthContext";
import ChatDialog from "../chat/ChatDialog";

const TaskCard = ({
  task,
  onStatusChange,
  onAddComment,
  onClick,
  onEdit,
  onDelete,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const { user } = useAuth();
  const [chatDialogOpen, setChatDialogOpen] = useState(false);

  const handleStatusClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleStatusChange = (newStatus) => {
    onStatusChange(task._id, newStatus);
    handleClose();
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "error";
      case "medium":
        return "warning";
      case "low":
        return "success";
      default:
        return "default";
    }
  };

  const handleChatClick = (event) => {
    event.stopPropagation();
    setChatDialogOpen(true);
  };

  return (
    <>
      <Card
        sx={{
          cursor: "pointer",
          "&:hover": { boxShadow: 6 },
        }}
        onClick={onClick}
      >
        <CardContent>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="flex-start"
          >
            <Typography variant="h6" component="div">
              {task.title}
            </Typography>
            <Box>
              <IconButton size="small" onClick={handleStatusClick}>
                <MoreVertIcon />
              </IconButton>
              <IconButton size="small" onClick={(e) => {
                e.stopPropagation();
                onAddComment(task);
              }}>
                <CommentIcon />
              </IconButton>
              <IconButton size="small" onClick={handleChatClick}>
                <ChatTwoToneIcon />
              </IconButton>
            </Box>
          </Box>

          <Typography color="textSecondary" gutterBottom noWrap>
            {task.description}
          </Typography>

          <Box display="flex" gap={1} mt={2}>
            <Chip
              label={task.status}
              color={task.status === "completed" ? "success" : "default"}
              size="small"
            />
            <Chip
              label={task.priority}
              color={getPriorityColor(task.priority)}
              size="small"
            />
            <Chip
              icon={<TimeIcon />}
              label={format(new Date(task.dueDate), "MMM dd")}
              size="small"
              variant="outlined"
            />
          </Box>

          <Box display="flex" flexDirection="column" mt={2}>
            <Typography variant="body2">
              Assigned By: {task.assignedByName}
            </Typography>
            <Typography variant="body2">
              Assigned To: {task.assignedToName}
            </Typography>
          </Box>

          {user?.id === task.createdBy && (
            <Box mt={2}>
              <IconButton size="small" onClick={() => onEdit(task)}>
                <EditIcon />
              </IconButton>
              <IconButton size="small" onClick={() => onDelete(task)}>
                <DeleteIcon />
              </IconButton>
            </Box>
          )}

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={() => handleStatusChange("pending")}>
              Set Pending
            </MenuItem>
            <MenuItem onClick={() => handleStatusChange("in_progress")}>
              Set In Progress
            </MenuItem>
            <MenuItem onClick={() => handleStatusChange("completed")}>
              Set Completed
            </MenuItem>
          </Menu>
        </CardContent>
      </Card>

      <ChatDialog
        open={chatDialogOpen}
        onClose={() => setChatDialogOpen(false)}
        task={{
          _id: task._id,
          title: task.title,
          assignedTo: task.assignedTo,
          assignedBy: task.createdBy,
          assignedToName: task.assignedToName,
          assignedByName: task.assignedByName
        }}
      />
    </>
  );
};

export default TaskCard;
