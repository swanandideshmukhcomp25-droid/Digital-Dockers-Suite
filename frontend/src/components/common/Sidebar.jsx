import {
    Drawer, List, ListItem, ListItemIcon, ListItemText,
    Box, Toolbar, Divider, ListItemButton
} from '@mui/material';
import {
    Dashboard, Assignment, Description, Email,
    BarChart, FitnessCenter, RecordVoiceOver, People, Settings, Chat
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useThemeMode } from '../../context/ThemeContext';

const drawerWidth = 240;

const Sidebar = ({ mobileOpen, handleDrawerToggle }) => {
    const { user } = useAuth();
    const { mode } = useThemeMode();
    const navigate = useNavigate();
    const location = useLocation();

    // ... menuItems ...
    const menuItems = [
        { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard', roles: ['all'] },
        { text: 'Tasks', icon: <Assignment />, path: '/dashboard/tasks', roles: ['project_manager', 'technical_lead', 'technical_team', 'marketing_team'] },
        { text: 'Meetings', icon: <RecordVoiceOver />, path: '/dashboard/meetings', roles: ['project_manager', 'technical_lead', 'technical_team', 'marketing_team'] },
        { text: 'Emails', icon: <Email />, path: '/dashboard/emails', roles: ['project_manager', 'marketing_team', 'marketing_lead'] },
        { text: 'Reports', icon: <BarChart />, path: '/dashboard/reports', roles: ['project_manager', 'marketing_lead', 'admin'] },
        { text: 'Documents', icon: <Description />, path: '/dashboard/documents', roles: ['technical_team', 'marketing_team'] },
        { text: 'Chat', icon: <Chat />, path: '/dashboard/chat', roles: ['all'] },
        { text: 'Organization', icon: <People />, path: '/dashboard/organization', roles: ['all'] },
        { text: 'Wellness', icon: <FitnessCenter />, path: '/dashboard/wellness', roles: ['all'] },
    ];

    const hasAccess = (itemRoles) => {
        if (itemRoles.includes('all')) return true;
        if (user?.role === 'admin') return true;
        return itemRoles.includes(user?.role);
    };

    const drawerContent = (
        <>
            <Toolbar sx={{ minHeight: '56px !important' }} />
            <Box sx={{ overflow: 'auto', pt: 2 }}>
                <List sx={{ px: 1 }}>
                    {menuItems.map((item) => (
                        hasAccess(item.roles) && (
                            <ListItemButton
                                key={item.text}
                                onClick={() => {
                                    navigate(item.path);
                                    if (mobileOpen) handleDrawerToggle();
                                }}
                                selected={location.pathname === item.path}
                                sx={{
                                    borderRadius: 1,
                                    mb: 0.5,
                                    '&.Mui-selected': {
                                        backgroundColor: mode === 'light' ? '#DEEBFF' : '#1C2B41',
                                        color: mode === 'light' ? '#0052CC' : '#579DFF',
                                        '& .MuiListItemIcon-root': {
                                            color: mode === 'light' ? '#0052CC' : '#579DFF',
                                        },
                                        '&:hover': {
                                            backgroundColor: mode === 'light' ? '#B3D4FF' : '#2C3E5D',
                                        },
                                    },
                                    '&:hover': {
                                        backgroundColor: mode === 'light' ? '#EBECF0' : '#282E33',
                                    },
                                }}
                            >
                                <ListItemIcon
                                    sx={{
                                        minWidth: 40,
                                        color: location.pathname === item.path ? '#0052CC' : '#5E6C84',
                                    }}
                                >
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.text}
                                    primaryTypographyProps={{
                                        fontSize: '0.875rem',
                                        fontWeight: location.pathname === item.path ? 600 : 400,
                                    }}
                                />
                            </ListItemButton>
                        )
                    ))}
                </List>
                <Divider sx={{ my: 2, mx: 2 }} />
                <List sx={{ px: 1 }}>
                    <ListItemButton
                        onClick={() => navigate('/dashboard/settings')}
                        sx={{
                            borderRadius: 1,
                            '&:hover': {
                                backgroundColor: '#EBECF0',
                            },
                        }}
                    >
                        <ListItemIcon sx={{ minWidth: 40, color: '#5E6C84' }}>
                            <Settings />
                        </ListItemIcon>
                        <ListItemText
                            primary="Settings"
                            primaryTypographyProps={{
                                fontSize: '0.875rem',
                            }}
                        />
                    </ListItemButton>
                </List>
            </Box>
        </>
    );

    return (
        <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
            {/* Mobile Drawer */}
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: 'block', sm: 'none' },
                    '& .MuiDrawer-paper': {
                        boxSizing: 'border-box',
                        width: drawerWidth,
                        borderRight: '1px solid rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(12px)',
                        background: (theme) => theme.palette.mode === 'light'
                            ? 'rgba(255, 255, 255, 0.95)'
                            : 'rgba(30, 41, 59, 0.95)',
                    },
                }}
            >
                {drawerContent}
            </Drawer>
            {/* Desktop Drawer */}
            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: 'none', sm: 'block' },
                    width: drawerWidth,
                    flexShrink: 0,
                    [`& .MuiDrawer-paper`]: {
                        width: drawerWidth - 20, // Floating width
                        margin: '10px',
                        height: 'calc(100% - 20px)',
                        borderRadius: '16px',
                        boxSizing: 'border-box',
                        backgroundColor: 'transparent',
                        borderRight: 'none',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(12px)',
                        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
                        background: (theme) => theme.palette.mode === 'light'
                            ? 'rgba(255, 255, 255, 0.75)'
                            : 'rgba(30, 41, 59, 0.75)',
                    },
                }}
                open
            >
                {drawerContent}
            </Drawer>
        </Box>
    );
};

export default Sidebar;
