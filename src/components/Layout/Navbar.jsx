import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Container,
  Button,
  useScrollTrigger,
  Slide,
  Avatar,
  Tooltip,
} from "@mui/material";
import { Menu as MenuIcon } from "@mui/icons-material";
import WorkIcon from "@mui/icons-material/Work";
import { motion } from "framer-motion";
import { useAuth } from "../../Context/AuthContext";
import NotificationBell from "../shared/NotificationBell";
import ChatIcon from "@mui/icons-material/Chat";
import VideoCallIcon from "@mui/icons-material/VideoCall";

// Hide on scroll functionality
function HideOnScroll({ children }) {
  const trigger = useScrollTrigger();
  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { label: "Home", path: "/" },
    // { label: 'Features', path: '/features' },
    { label: "Pricing", path: "/pricing" },
    { label: "About", path: "/about" },
    { label: "Contact", path: "/contact" },
  ];

  const superAdminNavItems = [
    { label: "Dashboard", path: "/super_admin_dashboard" },
    // { label: 'Companies', path: '/companies' },
  ];

  const companyAdminNavItems = [
    { label: "Dashboard", path: "/company_admin_dashboard" },
    // { label: 'Employees', path: '/employees' },
    // { label: 'Tasks', path: '/tasks' },
  ];

  const employeeNavItems = [
    { label: "Dashboard", path: "/employee_dashboard" },
    { label: "My Tasks", path: "/assigned-tasks" },
  ];

  const getNavItems = () => {
    if (user?.role === "super_admin") {
      return superAdminNavItems;
    } else if (user?.role === "company_admin") {
      return companyAdminNavItems;
    } else if (user?.role === "employee") {
      return employeeNavItems;
    } else {
      return navItems;
    }
  };

  const menuItems = [
    {
      text: "Profile",
      onClick: () => {
        navigate("/profile");
        handleCloseUserMenu();
      },
    },
    {
      text: "Logout",
      onClick: () => {
        handleLogout();
        handleCloseUserMenu();
      },
    },
  ];

  return (
    <HideOnScroll>
      <AppBar
        position="fixed"
        sx={{
          background: "linear-gradient(45deg, #0E2954 30%, #1F6E8C 90%)",
          boxShadow: "0 3px 5px 2px rgba(33, 203, 243, .3)",
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            {/* Desktop Logo */}
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              style={{ display: "flex", alignItems: "center" }}
            >
              <WorkIcon
                sx={{
                  display: { xs: "none", md: "flex" },
                  mr: 1,
                  cursor: "pointer",
                }}
                onClick={() => navigate("/")}
              />
              <Typography
                variant="h6"
                noWrap
                component="div"
                sx={{
                  mr: 4,
                  display: { xs: "none", md: "flex" },
                  fontWeight: 700,
                  letterSpacing: ".2rem",
                  color: "inherit",
                  textDecoration: "none",
                  cursor: "pointer",
                }}
                onClick={() => navigate("/")}
              >
                WorkZen
              </Typography>
            </motion.div>

            {/* Mobile Menu */}
            <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
              <IconButton
                size="large"
                aria-label="menu"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleOpenNavMenu}
                color="inherit"
              >
                <MenuIcon />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorElNav}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "left",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "left",
                }}
                open={Boolean(anchorElNav)}
                onClose={handleCloseNavMenu}
                sx={{
                  display: { xs: "block", md: "none" },
                }}
              >
                {getNavItems().map((item) => (
                  <MenuItem
                    key={item.label}
                    onClick={() => {
                      navigate(item.path);
                      handleCloseNavMenu();
                    }}
                  >
                    <Typography textAlign="center">{item.label}</Typography>
                  </MenuItem>
                ))}
                {user ? (
                  <>
                    <MenuItem
                      onClick={() => {
                        navigate("/chat");
                        handleCloseNavMenu();
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <ChatIcon sx={{ mr: 1, fontSize: "1.2rem" }} />
                        <Typography textAlign="center">Chat</Typography>
                      </Box>
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        window.open(
                          "https://video-conference-dobqfhtph-sagar-138s-projects.vercel.app/",
                          "_blank"
                        );
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <VideoCallIcon sx={{ mr: 1, fontSize: "1.2rem" }} />
                        <Typography textAlign="center">
                          Video Conference
                        </Typography>
                      </Box>
                    </MenuItem>
                    <MenuItem onClick={() => navigate("/profile")}>
                      <Typography textAlign="center">Manage Profile</Typography>
                    </MenuItem>
                    <MenuItem onClick={handleLogout}>
                      <Typography textAlign="center">Logout</Typography>
                    </MenuItem>
                  </>
                ) : (
                  <MenuItem
                    onClick={() => {
                      navigate("/login");
                      handleCloseNavMenu();
                    }}
                  >
                    <Typography textAlign="center">Login/Sign Up</Typography>
                  </MenuItem>
                )}
              </Menu>
            </Box>

            {/* Mobile Logo */}
            <Box
              sx={{
                flexGrow: 1,
                display: { xs: "flex", md: "none" },
                alignItems: "center",
              }}
            >
              <WorkIcon sx={{ mr: 1 }} />
              <Typography
                variant="h6"
                noWrap
                component="div"
                sx={{
                  fontWeight: 700,
                  letterSpacing: ".1rem",
                }}
              >
                WorkZen
              </Typography>
            </Box>

            {/* Desktop Menu */}
            <Box
              sx={{
                flexGrow: 1,
                display: { xs: "none", md: "flex" },
                justifyContent: "flex-end",
                alignItems: "center",
              }}
            >
              {getNavItems().map((item) => (
                <motion.div
                  key={item.label}
                  whileHover={{ y: -2 }}
                  whileTap={{ y: 0 }}
                >
                  <Button
                    onClick={() => navigate(item.path)}
                    sx={{
                      my: 2,
                      mx: 1,
                      color: "white",
                      display: "block",
                      fontSize: "1rem",
                      textTransform: "none",
                      "&:hover": {
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                      },
                    }}
                  >
                    {item.label}
                  </Button>
                </motion.div>
              ))}

              {/* Add Chat Button */}
              {user && (
                <>
                  <motion.div
                    whileHover={{ y: -2 }}
                    style={{ marginRight: "8px" }}
                  >
                    <Tooltip title="Chat">
                      <IconButton
                        onClick={() => navigate("/chat")}
                        sx={{
                          color: "white",
                          backgroundColor: "rgba(255, 255, 255, 0.1)",
                          "&:hover": {
                            backgroundColor: "rgba(255, 255, 255, 0.2)",
                          },
                        }}
                      >
                        <ChatIcon />
                      </IconButton>
                    </Tooltip>
                  </motion.div>

                  <motion.div
                    whileHover={{ y: -2 }}
                    style={{ marginRight: "8px" }}
                  >
                    <Tooltip title="Video Conference">
                      <IconButton
                        onClick={() => {
                          window.open("https://video-conference-dobqfhtph-sagar-138s-projects.vercel.app/", "_blank");
                        }}
                        sx={{
                          color: "white",
                          backgroundColor: "rgba(255, 255, 255, 0.1)",
                          "&:hover": {
                            backgroundColor: "rgba(255, 255, 255, 0.2)",
                          },
                        }}
                      >
                        <VideoCallIcon />
                      </IconButton>
                    </Tooltip>
                  </motion.div>
                </>
              )}

              {user ? (
                <>
                  <NotificationBell />
                  <Tooltip title="Open settings">
                    <IconButton onClick={handleOpenUserMenu} sx={{ ml: 2 }}>
                      <Avatar
                        src={
                          user?.avatar
                            ? `${import.meta.env.VITE_API_URL}${user.avatar}`
                            : null
                        }
                        alt={user?.name}
                        sx={{
                          width: 40,
                          height: 40,
                          border: "2px solid white",
                          "&:hover": {
                            border: "2px solid #90caf9",
                          },
                        }}
                      >
                        {!user?.avatar && user?.name?.charAt(0).toUpperCase()}
                      </Avatar>
                    </IconButton>
                  </Tooltip>
                  <Menu
                    sx={{ mt: "45px" }}
                    id="menu-appbar"
                    anchorEl={anchorElUser}
                    anchorOrigin={{
                      vertical: "top",
                      horizontal: "right",
                    }}
                    keepMounted
                    transformOrigin={{
                      vertical: "top",
                      horizontal: "right",
                    }}
                    open={Boolean(anchorElUser)}
                    onClose={handleCloseUserMenu}
                  >
                    {menuItems.map((item, index) => (
                      <MenuItem key={index} onClick={item.onClick}>
                        <Typography textAlign="center">{item.text}</Typography>
                      </MenuItem>
                    ))}
                  </Menu>
                </>
              ) : (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => navigate("/login")}
                    sx={{
                      ml: 2,
                      px: 3,
                      py: 1,
                      borderRadius: "20px",
                      textTransform: "none",
                      fontSize: "1rem",
                      fontWeight: 500,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                      "&:hover": {
                        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                      },
                    }}
                  >
                    Login
                  </Button>
                </motion.div>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
    </HideOnScroll>
  );
};

export default Navbar;
