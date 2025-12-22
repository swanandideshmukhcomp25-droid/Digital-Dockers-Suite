import { Typography, Grid, Paper, Box, Card, CardContent, Chip, LinearProgress } from '@mui/material';
import { TrendingUp, Assignment, People, CheckCircle } from '@mui/icons-material';
import TaskBoard from '../tasks/TaskBoard';
import MeetingList from '../meetings/MeetingList';
import WellnessCheckin from '../wellness/WellnessCheckin';
import CalendarView from '../calendar/CalendarView';
import CalendarWidget from '../calendar/CalendarWidget';
import EmailListWidget from '../email/EmailListWidget';

const TechnicalTeamDashboard = () => {
    const stats = [
        { label: 'Active Tasks', value: '12', icon: <Assignment />, color: '#0052CC', change: '+3' },
        { label: 'Completed', value: '45', icon: <CheckCircle />, color: '#00875A', change: '+8' },
        { label: 'In Review', value: '5', icon: <People />, color: '#6554C0', change: '+2' },
        { label: 'Productivity', value: '87%', icon: <TrendingUp />, color: '#FF991F', change: '+5%' },
    ];

    return (
        <Box>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.5 }}>
                    My Workbench
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Track your tasks, meetings, and wellness
                </Typography>
            </Box>

            {/* Stats Cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                {stats.map((stat, index) => (
                    <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                        <Card
                            elevation={0}
                            sx={{
                                border: '1px solid #DFE1E6',
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
                <Grid size={{ xs: 12, lg: 8 }}>
                    <TaskBoard />
                </Grid>
                <Grid size={{ xs: 12, lg: 4 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <CalendarWidget />
                        <EmailListWidget />
                        <Paper
                            elevation={0}
                            sx={{
                                border: '1px solid #DFE1E6',
                                borderRadius: 1,
                            }}
                        >
                            <Box sx={{ p: 2, borderBottom: '1px solid #DFE1E6' }}>
                                <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600 }}>
                                    Team Meetings
                                </Typography>
                            </Box>
                            <MeetingList />
                        </Paper>

                        <CalendarView />
                        <WellnessCheckin />
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
};

export default TechnicalTeamDashboard;
