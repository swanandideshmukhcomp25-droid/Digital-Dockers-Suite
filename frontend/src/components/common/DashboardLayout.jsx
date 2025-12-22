import { useState } from 'react';
import { Box, Toolbar } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const DashboardLayout = () => {
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <Header handleDrawerToggle={handleDrawerToggle} />
            <Sidebar mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} />
            <Box component="main" sx={{
                flexGrow: 1,
                p: 3,
                minHeight: '100vh',
                background: (theme) => theme.palette.mode === 'light'
                    ? 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)'
                    : 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)'
            }}>
                <Toolbar />
                <Outlet />
            </Box>
        </Box>
    );
};

export default DashboardLayout;
