import { Typography, Grid, Paper, Box, Card, CardContent, Chip, Button } from '@mui/material';
import { Campaign, TrendingUp, Email, BarChart, Add } from '@mui/icons-material';
import EmailGenerator from '../email/EmailGenerator';
import DocumentManager from '../documents/DocumentManager';
import CalendarWidget from '../calendar/CalendarWidget';
import EmailListWidget from '../email/EmailListWidget';

const MarketingTeamDashboard = () => {
    const stats = [
        { label: 'Active Campaigns', value: '12', icon: <Campaign />, color: '#0052CC', change: '+3' },
        { label: 'Engagement Rate', value: '4.2%', icon: <TrendingUp />, color: '#00875A', change: '+0.8%' },
        { label: 'Emails Sent', value: '2.4K', icon: <Email />, color: '#6554C0', change: '+340' },
        { label: 'Conversions', value: '156', icon: <BarChart />, color: '#FF991F', change: '+23' },
    ];

    const campaigns = [
        { name: 'Summer Sale 2024', status: 'Active', reach: '45K', engagement: '5.2%' },
        { name: 'Product Launch', status: 'Scheduled', reach: '32K', engagement: '4.8%' },
        { name: 'Newsletter Q1', status: 'Active', reach: '28K', engagement: '3.9%' },
    ];

    return (
        <Box>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.5 }}>
                        Marketing Dashboard
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Campaign management and content creation
                    </Typography>
                </Box>
                <Button variant="contained" startIcon={<Add />}>
                    New Campaign
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
                    <EmailGenerator />
                    <Box sx={{ mt: 3 }}>
                        <DocumentManager />
                    </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Box sx={{ mb: 3 }}>
                        <CalendarWidget />
                    </Box>
                    <Box sx={{ mb: 3 }}>
                        <EmailListWidget />
                    </Box>
                    <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                            Campaign Performance
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {campaigns.map((campaign, idx) => (
                                <Box
                                    key={idx}
                                    sx={{
                                        p: 2,
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        borderRadius: 1,
                                    }}
                                >
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="body2" fontWeight={500}>
                                            {campaign.name}
                                        </Typography>
                                        <Chip
                                            label={campaign.status}
                                            size="small"
                                            sx={{
                                                height: 20,
                                                fontSize: '0.7rem',
                                                bgcolor: campaign.status === 'Active' ? '#E3FCEF' : '#FFF0B3',
                                                color: campaign.status === 'Active' ? '#00875A' : '#FF991F',
                                            }}
                                        />
                                    </Box>
                                    <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">
                                                Reach
                                            </Typography>
                                            <Typography variant="body2" fontWeight={500}>
                                                {campaign.reach}
                                            </Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">
                                                Engagement
                                            </Typography>
                                            <Typography variant="body2" fontWeight={500}>
                                                {campaign.engagement}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default MarketingTeamDashboard;
