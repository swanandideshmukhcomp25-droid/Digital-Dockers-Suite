import { Typography, Grid, Paper, Box, Card, CardContent, Chip, Button } from '@mui/material';
import { People, Assignment, TrendingUp, CheckCircle, Add } from '@mui/icons-material';
import TaskBoard from '../tasks/TaskBoard';
import MeetingList from '../meetings/MeetingList';
import CalendarWidget from '../calendar/CalendarWidget';
import EmailListWidget from '../email/EmailListWidget';

const TeamLeadDashboard = () => {
    const stats = [
        { label: 'Team Size', value: '12', icon: <People />, color: '#0052CC', change: '+2' },
        { label: 'Active Tasks', value: '28', icon: <Assignment />, color: '#6554C0', change: '+5' },
        { label: 'Completed', value: '89', icon: <CheckCircle />, color: '#00875A', change: '+12' },
        { label: 'Team Velocity', value: '92%', icon: <TrendingUp />, color: '#FF991F', change: '+7%' },
    ];

    const teamMembers = [
        { name: 'Alice Johnson', role: 'Senior Developer', tasks: 5, status: 'Active' },
        { name: 'Bob Smith', role: 'UI Designer', tasks: 3, status: 'Active' },
        { name: 'Carol White', role: 'QA Engineer', tasks: 4, status: 'On Leave' },
        { name: 'David Brown', role: 'Developer', tasks: 6, status: 'Active' },
    ];

    return (
        <Box>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.5 }}>
                        Team Lead Dashboard
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Manage your team and track progress
                    </Typography>
                </Box>
                <Button variant="contained" startIcon={<Add />}>
                    Assign Task
                </Button>
            </Box>

            {/* Stats Cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                {stats.map((stat, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                        <Card
                            elevation={0}
                            sx={{
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
                                            bgcolor: '#E3FCEF',
                                            color: '#00875A',
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
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Main Content */}
            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    <TaskBoard />
                </Grid>
                <Grid item xs={12} md={4}>
                    <Box sx={{ mb: 3 }}>
                        <CalendarWidget />
                    </Box>
                    <Box sx={{ mb: 3 }}>
                        <EmailListWidget />
                    </Box>
                    <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', mb: 3 }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                            Team Members
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {teamMembers.map((member, idx) => (
                                <Box
                                    key={idx}
                                    sx={{
                                        p: 2,
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        borderRadius: 1,
                                    }}
                                >
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                        <Typography variant="body2" fontWeight={500}>
                                            {member.name}
                                        </Typography>
                                        <Chip
                                            label={member.status}
                                            size="small"
                                            sx={{
                                                height: 20,
                                                fontSize: '0.7rem',
                                                bgcolor: member.status === 'Active' ? '#E3FCEF' : '#EBECF0',
                                                color: member.status === 'Active' ? '#00875A' : '#5E6C84',
                                            }}
                                        />
                                    </Box>
                                    <Typography variant="caption" color="text.secondary" display="block">
                                        {member.role}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {member.tasks} active tasks
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    </Paper>
                    <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
                        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                            <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600 }}>
                                Upcoming Meetings
                            </Typography>
                        </Box>
                        <MeetingList />
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default TeamLeadDashboard;
