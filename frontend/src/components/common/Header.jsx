import { AppBar, Toolbar, Typography, Box, Avatar, IconButton, Menu, MenuItem, Switch, FormControlLabel } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { useThemeMode } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { AccountCircle, Notifications, Help, Apps, DarkMode, LightMode, Menu as MenuIcon } from '@mui/icons-material';
import { useState } from 'react';

const Header = ({ handleDrawerToggle }) => {
    const { user, logout } = useAuth();
    const { mode, toggleTheme } = useThemeMode();
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState(null);

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        handleClose();
        logout();
        navigate('/login');
    };

    const handleProfile = () => {
        handleClose();
        navigate('/dashboard/profile');
    };

    return (
        <AppBar
            position="fixed"
            sx={{
                zIndex: (theme) => theme.zIndex.drawer + 1,
                backgroundColor: mode === 'light' ? '#FFFFFF' : '#282E33',
                color: mode === 'light' ? '#172B4D' : '#B6C2CF',
                boxShadow: mode === 'light'
                    ? '0px 1px 0px rgba(9, 30, 66, 0.13)'
                    : '0px 1px 0px rgba(0, 0, 0, 0.3)',
                width: { sm: `calc(100% - ${240}px)` },
                ml: { sm: `${240}px` },
            }}
        >
            <Toolbar sx={{ minHeight: '56px !important' }}>
                <IconButton
                    color="inherit"
                    aria-label="open drawer"
                    edge="start"
                    onClick={handleDrawerToggle}
                    sx={{ mr: 2, display: { sm: 'none' } }}
                >
                    <MenuIcon />
                </IconButton>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Apps sx={{ color: '#0052CC', fontSize: 28 }} />
                    <Typography
                        variant="h6"
                        noWrap
                        component="div"
                        sx={{
                            fontWeight: 600,
                            fontSize: '1.25rem',
                        }}
                    >
                        Digital Dockers
                    </Typography>
                </Box>

                <Box sx={{ flexGrow: 1 }} />

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton onClick={toggleTheme} size="medium">
                        {mode === 'dark' ? <LightMode /> : <DarkMode />}
                    </IconButton>
                    <IconButton size="medium">
                        <Help />
                    </IconButton>
                    <IconButton size="medium">
                        <Notifications />
                    </IconButton>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 1 }}>
                        <Avatar
                            sx={{
                                bgcolor: '#0052CC',
                                width: 32,
                                height: 32,
                                fontSize: '0.875rem',
                                cursor: 'pointer',
                                '&:hover': {
                                    bgcolor: '#0747A6',
                                }
                            }}
                            onClick={handleMenu}
                        >
                            {user?.fullName?.[0]}
                        </Avatar>
                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleClose}
                            PaperProps={{
                                sx: {
                                    mt: 1,
                                    minWidth: 200,
                                    boxShadow: mode === 'light'
                                        ? '0px 4px 8px rgba(9, 30, 66, 0.2)'
                                        : '0px 4px 8px rgba(0, 0, 0, 0.5)',
                                }
                            }}
                        >
                            <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                                <Typography variant="body2" fontWeight={600}>
                                    {user?.fullName}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {user?.email}
                                </Typography>
                            </Box>
                            <MenuItem onClick={handleProfile}>Profile</MenuItem>
                            <MenuItem onClick={() => { handleClose(); navigate('/dashboard/settings'); }}>Settings</MenuItem>
                            <Box sx={{ px: 2, py: 1 }}>
                                <FormControlLabel
                                    control={<Switch checked={mode === 'dark'} onChange={toggleTheme} size="small" />}
                                    label={<Typography variant="body2">Dark Mode</Typography>}
                                />
                            </Box>
                            <Box sx={{ borderTop: '1px solid', borderColor: 'divider', mt: 1 }}>
                                <MenuItem onClick={handleLogout}>Log out</MenuItem>
                            </Box>
                        </Menu>
                    </Box>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Header;
