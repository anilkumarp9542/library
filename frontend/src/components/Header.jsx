import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Menu, MenuItem, Box, Drawer, List, ListItem, ListItemText } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';
import { useNavigate } from 'react-router-dom';
import { logout } from '../services/api';

const Header = ({ role, username, onLogout }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const navigate = useNavigate();

  const handleMenuOpen = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const toggleDrawer = (open) => {
    setDrawerOpen(open);
  };

  const adminMenuItems = [
    { label: 'Home', action: () => navigate('/admin') },
    { label: 'Librarian Management', action: () => navigate('/admin/create-update-delete-librarian') },
    { label: 'Book Management', action: () => navigate('/admin/create-update-delete-book') },
    { label: 'View Borrow History', action: () => navigate('/admin/borrow-history') },
  ];

  const librarianMenuItems = [
    { label: 'Home', action: () => navigate('/librarian') },
    { label: 'Book Management', action: () => navigate('/librarian/create-update-delete-book') },
    { label: 'View Borrow History', action: () => navigate('/librarian/borrow-history') },
  ];

  const memberMenuItems = [
    { label: 'Home', action: () => navigate('/member') },
    { label: 'Return Book', action: () => navigate('/member/return-book') },
    { label: 'View Borrow History', action: () => navigate('/member/borrow-history') },
  ];

  const getMenuItems = () => {
    if (role === 'Admin') return adminMenuItems;
    if (role === 'Librarian') return librarianMenuItems;
    if (role === 'Member') return memberMenuItems;
    return [];
  };

  const handleLogout = async () => {
    try {
      await logout();
      onLogout();
      navigate('/'); // Redirect to the login page
    } catch (error) {
      alert('Logout failed');
    }
  };

  const handleMenuItemClick = (action) => {
    action();
    setDrawerOpen(false); // Close the drawer when a menu item is clicked
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={() => toggleDrawer(true)}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h4" sx={{ flexGrow: 1, textAlign: 'center' }}>
            Online Library Portal
          </Typography>
          <IconButton
            edge="end"
            color="inherit"
            onClick={handleMenuOpen}
          >
            <AccountCircle />
          </IconButton>
          <Menu
            anchorEl={menuAnchorEl}
            open={Boolean(menuAnchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Toolbar>
        <Typography align="center" variant="subtitle1" sx={{ mt: 1, mb: 1 }}>
          Welcome, {username}
        </Typography>
      </AppBar>
      <Drawer anchor="left" open={drawerOpen} onClose={() => toggleDrawer(false)}>
        <Box sx={{ width: 250 }} role="presentation">
        <List>
            {getMenuItems().map((item, index) => (
              <ListItem
                key={index}
                button
                onClick={() => handleMenuItemClick(item.action)}
                sx={{
                  cursor: 'pointer', // Always show pointer
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.1)', // Optional hover effect
                  },
                }} // Change cursor to pointer
              >
                <ListItemText primary={item.label} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default Header;
