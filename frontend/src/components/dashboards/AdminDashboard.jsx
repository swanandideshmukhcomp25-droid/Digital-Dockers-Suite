import { useState, useEffect } from 'react';
import {
    Typography, Grid, Paper, Box, Card, CardContent, Chip, Button,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    FormControl, Select, MenuItem, Avatar, IconButton, CircularProgress
} from '@mui/material';
import {
    People, Assignment, TrendingUp, EventNote, Add,
    Edit, Save, Cancel, MoreVert, Refresh
} from '@mui/icons-material';
import api from '../../services/api';
import GlassCard from '../common/GlassCard';
import CalendarWidget from '../calendar/CalendarWidget';
import EmailListWidget from '../email/EmailListWidget';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const ROLES = [
    { value: 'admin', label: 'Admin' },
    { value: 'project_manager', label: 'Project Manager' },
    { value: 'technical_lead', label: 'Technical Lead' },
    { value: 'marketing_lead', label: 'Marketing Lead' },
    { value: 'technical_team', label: 'Technical Team' },
    { value: 'marketing_team', label: 'Marketing Team' }
];

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingUserId, setEditingUserId] = useState(null);
    const [selectedRole, setSelectedRole] = useState('');

    const [stats, setStats] = useState({
        totalUsers: 0,
        activeProjects: 24, // Placeholder
        systemHealth: '98%',
        meetingsToday: 18 // Placeholder
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/users');
            setUsers(res.data);
            setStats(prev => ({ ...prev, totalUsers: res.data.length }));
        } catch (error) {
            console.error('Failed to fetch users', error);
            // toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (user) => {
        setEditingUserId(user._id);
        setSelectedRole(user.role);
    };

    const handleCancelEdit = () => {
        setEditingUserId(null);
        setSelectedRole('');
    };

    const handleSaveRole = async (userId) => {
        try {
            await api.put(`/users/${userId}/role`, { role: selectedRole });

            setUsers(users.map(user =>
                user._id === userId ? { ...user, role: selectedRole } : user
            ));

            toast.success('User role updated successfully');
            setEditingUserId(null);
        } catch (error) {
            toast.error('Failed to update role');
        }
    };

    const getRoleLabel = (roleValue) => {
        const role = ROLES.find(r => r.value === roleValue);
        return role ? role.label : roleValue;
    };

    const getRoleColor = (role) => {
        if (role.includes('admin')) return 'error';
        if (role.includes('manager')) return 'warning';
        if (role.includes('lead')) return 'secondary';
        return 'primary';
    };

    const statCards = [
        { label: 'Total Users', value: stats.totalUsers, icon: <People />, color: '#0052CC', change: '+12' },
        { label: 'Active Projects', value: stats.activeProjects, icon: <Assignment />, color: '#00875A', change: '+3' },
        { label: 'System Health', value: stats.systemHealth, icon: <TrendingUp />, color: '#6554C0', change: '+2%' },
        { label: 'Meetings Today', value: stats.meetingsToday, icon: <EventNote />, color: '#FF991F', change: '+5' },
    ];

    return (
        <Box>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.5 }}>
                        Admin Dashboard
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        System overview and user management
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button variant="outlined" startIcon={<Refresh />} onClick={fetchUsers}>
                        Refresh
                    </Button>
                    <Button variant="contained" startIcon={<Add />}>
                        Add User
                    </Button>
                </Box>
            </Box>

            {/* Stats Cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                {statCards.map((stat, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                        <GlassCard
                            sx={{
                                height: '100%',
                                border: '1px solid',
                                borderColor: 'divider',
                                transition: 'all 0.2s',
                                '&:hover': {
                                    borderColor: stat.color,
                                    boxShadow: `0 0 0 1px ${stat.color}`,
                                }
                            }}
                        >
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                    <Box sx={{ color: stat.color }}>
                                        {stat.icon}
                                    </Box>
                                    <Chip
                                        label={stat.change}
                                        size="small"
                                        sx={{
                                            height: 20,
                                            fontSize: '0.75rem',
                                            bgcolor: `${stat.color}15`,
                                            color: stat.color,
                                            fontWeight: 600,
                                        }}
                                    />
                                </Box>
                                <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.5 }}>
                                    {stat.value}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {stat.label}
                                </Typography>
                            </CardContent>
                        </GlassCard>
                    </Grid>
                ))}
            </Grid>



            {/* Main Content Areas */}
            <Grid container spacing={3}>
                {/* Calendar Widget Column */}
                <Grid item xs={12} md={4}>
                    <Grid container spacing={3} direction="column">
                        <Grid item>
                            <CalendarWidget />
                        </Grid>
                        <Grid item>
                            <EmailListWidget />
                        </Grid>
                    </Grid>
                </Grid>

                {/* User Table Column */}
                <Grid item xs={12} md={8}>
                    {/* User Management Table */}
                    <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
                        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                All Users
                            </Typography>
                        </Box>

                        {loading ? (
                            <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            <TableContainer sx={{ maxHeight: 600 }}>
                                <Table stickyHeader>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>User</TableCell>
                                            <TableCell>Email</TableCell>
                                            <TableCell>Role / Position</TableCell>
                                            <TableCell>Status</TableCell>
                                            <TableCell>Joined Date</TableCell>
                                            <TableCell align="right">Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {users.map((user) => (
                                            <TableRow key={user._id} hover>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 14 }}>
                                                            {user.fullName ? user.fullName[0] : user.email[0]}
                                                        </Avatar>
                                                        <Typography variant="body2" fontWeight={500}>
                                                            {user.fullName || 'No Name'}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>{user.email}</TableCell>
                                                <TableCell>
                                                    {editingUserId === user._id ? (
                                                        <FormControl size="small" fullWidth>
                                                            <Select
                                                                value={selectedRole}
                                                                onChange={(e) => setSelectedRole(e.target.value)}
                                                            >
                                                                {ROLES.map(role => (
                                                                    <MenuItem key={role.value} value={role.value}>
                                                                        {role.label}
                                                                    </MenuItem>
                                                                ))}
                                                            </Select>
                                                        </FormControl>
                                                    ) : (
                                                        <Chip
                                                            label={getRoleLabel(user.role)}
                                                            size="small"
                                                            color={getRoleColor(user.role)}
                                                            variant="outlined"
                                                        />
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label="Active"
                                                        size="small"
                                                        color="success"
                                                        sx={{ height: 24, fontSize: '0.75rem' }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    {format(new Date(user.createdAt || Date.now()), 'MMM d, yyyy')}
                                                </TableCell>
                                                <TableCell align="right">
                                                    {editingUserId === user._id ? (
                                                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                                            <IconButton size="small" color="primary" onClick={() => handleSaveRole(user._id)}>
                                                                <Save />
                                                            </IconButton>
                                                            <IconButton size="small" color="error" onClick={handleCancelEdit}>
                                                                <Cancel />
                                                            </IconButton>
                                                        </Box>
                                                    ) : (
                                                        <Button
                                                            size="small"
                                                            startIcon={<Edit />}
                                                            onClick={() => handleEditClick(user)}
                                                        >
                                                            Edit Role
                                                        </Button>
                                                        // <IconButton size="small" onClick={() => handleEditClick(user)}>
                                                        //     <Edit fontSize="small" />
                                                        // </IconButton>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default AdminDashboard;
