import { useState, useEffect } from 'react';
import {
    List, ListItem, ListItemText, ListItemAvatar, Avatar,
    Typography, Paper, CircularProgress, Chip, Box, Button
} from '@mui/material';
import { VideoCall, Schedule, Add } from '@mui/icons-material';
import { format, isPast, isFuture } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const MeetingList = ({ limit = 5 }) => {
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { user } = useAuth();

    const canScheduleMeetings = ['admin', 'project_manager', 'technical_lead', 'marketing_lead'].includes(user?.role);

    useEffect(() => {
        const fetchMeetings = async () => {
            try {
                const res = await api.get('/meetings');
                setMeetings(Array.isArray(res.data) ? res.data.slice(0, limit) : []);
            } catch (error) {
                console.error(error);
                setMeetings([]);
            } finally {
                setLoading(false);
            }
        };
        fetchMeetings();
    }, [limit]);

    if (loading) {
        return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <CircularProgress size={24} />
            </Box>
        );
    }

    if (!meetings || meetings.length === 0) {
        return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <VideoCall sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                    No meetings yet
                </Typography>
                {canScheduleMeetings && (
                    <Button
                        size="small"
                        sx={{ mt: 1 }}
                        onClick={() => navigate('/dashboard/meetings')}
                    >
                        Schedule a meeting
                    </Button>
                )}
            </Box>
        );
    }

    return (
        <Box>
            <List sx={{ p: 0 }}>
                {meetings.map((meeting, index) => {
                    const isUpcoming = isFuture(new Date(meeting.scheduledAt));
                    return (
                        <ListItem
                            key={meeting._id}
                            sx={{
                                borderBottom: index < meetings.length - 1 ? '1px solid' : 'none',
                                borderColor: 'divider',
                                '&:hover': { bgcolor: 'action.hover' }
                            }}
                            secondaryAction={
                                <Chip
                                    label={isUpcoming ? 'Upcoming' : 'Past'}
                                    size="small"
                                    color={isUpcoming ? 'primary' : 'default'}
                                    variant="outlined"
                                />
                            }
                        >
                            <ListItemAvatar>
                                <Avatar sx={{ bgcolor: isUpcoming ? '#0052CC' : 'grey.400' }}>
                                    <VideoCall />
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                                primary={meeting.title}
                                secondary={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <Schedule fontSize="inherit" />
                                        {format(new Date(meeting.scheduledAt), 'MMM d, h:mm a')}
                                    </Box>
                                }
                                primaryTypographyProps={{ fontWeight: 500 }}
                            />
                        </ListItem>
                    );
                })}
            </List>
            <Box sx={{ p: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                <Button
                    fullWidth
                    size="small"
                    onClick={() => navigate('/dashboard/meetings')}
                >
                    View All Meetings
                </Button>
            </Box>
        </Box>
    );
};

export default MeetingList;
