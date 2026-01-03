import { useState, useEffect } from 'react';
import { Paper, Typography, Box, List, ListItem, ListItemText, Button, CircularProgress } from '@mui/material';
import { Event, Sync } from '@mui/icons-material';
import api from '../../services/api';

const CalendarView = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [authUrl, setAuthUrl] = useState(null);

    useEffect(() => {
        // Check if we can get events or if we need auth
        // For this demo, we'll try to get auth URL first if no events
        const checkAuth = async () => {
            try {
                const res = await api.get('/calendar/auth');
                setAuthUrl(res.data.url);
            } catch {
                // console.log("Auth not needed or failed");
            }
        };
        checkAuth();
    }, []);

    const handleSync = async () => {
        setLoading(true);
        // Mock sync
        setTimeout(() => {
            setEvents([
                { id: 1, summary: 'Team Standup', start: { dateTime: new Date().toISOString() } },
                { id: 2, summary: 'Client Sync', start: { dateTime: new Date(Date.now() + 86400000).toISOString() } },
            ]);
            setLoading(false);
        }, 1500);
    };

    return (
        <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6"><Event sx={{ verticalAlign: 'middle', mr: 1 }} /> Calendar</Typography>
                <Button startIcon={<Sync />} onClick={handleSync} disabled={loading}>
                    Sync
                </Button>
            </Box>

            {loading ? <CircularProgress /> : (
                <List dense>
                    {events.length === 0 ? (
                        <Typography variant="body2" color="textSecondary">No upcoming events synced.</Typography>
                    ) : (
                        events.map(ev => (
                            <ListItem key={ev.id}>
                                <ListItemText
                                    primary={ev.summary}
                                    secondary={new Date(ev.start.dateTime).toLocaleString()}
                                />
                            </ListItem>
                        ))
                    )}
                </List>
            )}

            {authUrl && events.length === 0 && (
                <Box sx={{ mt: 2 }}>
                    <Button variant="outlined" size="small" href={authUrl} target="_blank">
                        Connect Google Calendar
                    </Button>
                </Box>
            )}
        </Paper>
    );
};

export default CalendarView;
