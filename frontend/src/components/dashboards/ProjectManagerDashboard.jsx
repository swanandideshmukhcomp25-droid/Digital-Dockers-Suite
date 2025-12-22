import { Typography, Grid, Paper, Box, Card, CardContent, Chip, Button, LinearProgress } from '@mui/material';
import { Assignment, People, CheckCircle, Schedule, Add } from '@mui/icons-material';
import TaskBoard from '../tasks/TaskBoard';
import MeetingUploader from '../meetings/MeetingUploader';
import CalendarWidget from '../calendar/CalendarWidget';
import EmailListWidget from '../email/EmailListWidget';

const ProjectManagerDashboard = () => {
    const stats = [
        { label: 'Active Projects', value: '8', icon: <Assignment />, color: '#0052CC', change: '+2' },
        { label: 'Team Members', value: '32', icon: <People />, color: '#6554C0', change: '+4' },
        { label: 'Completed Tasks', value: '156', icon: <CheckCircle />, color: '#00875A', change: '+23' },
        { label: 'Pending Reviews', value: '12', icon: <Schedule />, color: '#FF991F', change: '+3' },
    ];

    const projects = [
        { name: 'Website Redesign', progress: 75, status: 'On Track', team: 8 },
        { name: 'Mobile App', progress: 45, status: 'At Risk', team: 6 },
        { name: 'API Integration', progress: 90, status: 'On Track', team: 4 },
    ];

    return (
        <Box>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.5 }}>
                        Project Manager Dashboard
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Manage projects, teams, and deliverables
                    </Typography>
                </Box>
                <Button variant="contained" startIcon={<Add />}>
                    New Project
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
                            Project Status
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            {projects.map((project, idx) => (
                                <Box key={idx}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="body2" fontWeight={500}>
                                            {project.name}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {project.progress}%
                                        </Typography>
                                    </Box>
                                    <LinearProgress
                                        variant="determinate"
                                        value={project.progress}
                                        sx={{ mb: 1, height: 6, borderRadius: 3 }}
                                    />
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Chip
                                            label={project.status}
                                            size="small"
                                            sx={{
                                                height: 20,
                                                fontSize: '0.7rem',
                                                bgcolor: project.status === 'On Track' ? '#E3FCEF' : '#FFEBE6',
                                                color: project.status === 'On Track' ? '#00875A' : '#DE350B',
                                            }}
                                        />
                                        <Typography variant="caption" color="text.secondary">
                                            {project.team} members
                                        </Typography>
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    </Paper>
                    <MeetingUploader />
                </Grid>
            </Grid>
        </Box>
    );
};

export default ProjectManagerDashboard;
