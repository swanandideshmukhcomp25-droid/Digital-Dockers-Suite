import { useState } from 'react';
import {
    Typography, Box, Paper, Switch, FormControlLabel, Divider,
    TextField, Button, Grid, Avatar, IconButton, Tabs, Tab,
    Select, MenuItem, FormControl, InputLabel, Alert
} from '@mui/material';
import { PhotoCamera, Save } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useThemeMode } from '../../context/ThemeContext';
import { toast } from 'react-toastify';

function TabPanel({ children, value, index }) {
    return (
        <div hidden={value !== index} style={{ paddingTop: 24 }}>
            {value === index && children}
        </div>
    );
}

const SettingsPage = () => {
    const { user } = useAuth();
    const { mode, toggleTheme } = useThemeMode();
    const [activeTab, setActiveTab] = useState(0);
    const [profileData, setProfileData] = useState({
        fullName: user?.fullName || '',
        email: user?.email || '',
        department: user?.department || '',
        phone: '',
        bio: '',
    });
    const [notifications, setNotifications] = useState({
        email: true,
        push: true,
        taskUpdates: true,
        meetingReminders: true,
        weeklyDigest: false,
    });
    const [security, setSecurity] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const handleProfileChange = (e) => {
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
    };

    const handleNotificationChange = (e) => {
        setNotifications({ ...notifications, [e.target.name]: e.target.checked });
    };

    const handleSecurityChange = (e) => {
        setSecurity({ ...security, [e.target.name]: e.target.value });
    };

    const handleSaveProfile = () => {
        // API call to update profile
        toast.success('Profile updated successfully!');
    };

    const handleSaveNotifications = () => {
        // API call to update notification preferences
        toast.success('Notification preferences saved!');
    };

    const handleChangePassword = () => {
        if (security.newPassword !== security.confirmPassword) {
            toast.error('Passwords do not match!');
            return;
        }
        // API call to change password
        toast.success('Password changed successfully!');
        setSecurity({ currentPassword: '', newPassword: '', confirmPassword: '' });
    };

    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
                Settings
            </Typography>

            <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
                <Tabs
                    value={activeTab}
                    onChange={(e, newValue) => setActiveTab(newValue)}
                    sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
                >
                    <Tab label="Profile" />
                    <Tab label="Notifications" />
                    <Tab label="Appearance" />
                    <Tab label="Security" />
                </Tabs>

                {/* Profile Tab */}
                <TabPanel value={activeTab} index={0}>
                    <Box sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
                            <Box sx={{ position: 'relative' }}>
                                <Avatar
                                    sx={{
                                        width: 100,
                                        height: 100,
                                        fontSize: 40,
                                        bgcolor: '#0052CC',
                                    }}
                                >
                                    {user?.fullName?.[0]}
                                </Avatar>
                                <IconButton
                                    sx={{
                                        position: 'absolute',
                                        bottom: 0,
                                        right: 0,
                                        bgcolor: 'background.paper',
                                        border: '2px solid',
                                        borderColor: 'divider',
                                        '&:hover': { bgcolor: 'background.paper' }
                                    }}
                                    size="small"
                                >
                                    <PhotoCamera fontSize="small" />
                                </IconButton>
                            </Box>
                            <Box>
                                <Typography variant="h6">{user?.fullName}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {user?.role?.replace('_', ' ').toUpperCase()}
                                </Typography>
                            </Box>
                        </Box>

                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Full Name"
                                    name="fullName"
                                    value={profileData.fullName}
                                    onChange={handleProfileChange}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Email"
                                    name="email"
                                    value={profileData.email}
                                    onChange={handleProfileChange}
                                    disabled
                                    helperText="Email cannot be changed"
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Department"
                                    name="department"
                                    value={profileData.department}
                                    onChange={handleProfileChange}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Phone Number"
                                    name="phone"
                                    value={profileData.phone}
                                    onChange={handleProfileChange}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Bio"
                                    name="bio"
                                    value={profileData.bio}
                                    onChange={handleProfileChange}
                                    multiline
                                    rows={4}
                                    placeholder="Tell us about yourself..."
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Button
                                    variant="contained"
                                    startIcon={<Save />}
                                    onClick={handleSaveProfile}
                                >
                                    Save Changes
                                </Button>
                            </Grid>
                        </Grid>
                    </Box>
                </TabPanel>

                {/* Notifications Tab */}
                <TabPanel value={activeTab} index={1}>
                    <Box sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            Email Notifications
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={notifications.email}
                                        onChange={handleNotificationChange}
                                        name="email"
                                    />
                                }
                                label={
                                    <Box>
                                        <Typography variant="body1">Email Notifications</Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Receive email updates about your activity
                                        </Typography>
                                    </Box>
                                }
                            />
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={notifications.taskUpdates}
                                        onChange={handleNotificationChange}
                                        name="taskUpdates"
                                    />
                                }
                                label={
                                    <Box>
                                        <Typography variant="body1">Task Updates</Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Get notified when tasks are assigned or updated
                                        </Typography>
                                    </Box>
                                }
                            />
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={notifications.meetingReminders}
                                        onChange={handleNotificationChange}
                                        name="meetingReminders"
                                    />
                                }
                                label={
                                    <Box>
                                        <Typography variant="body1">Meeting Reminders</Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Receive reminders before scheduled meetings
                                        </Typography>
                                    </Box>
                                }
                            />
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={notifications.weeklyDigest}
                                        onChange={handleNotificationChange}
                                        name="weeklyDigest"
                                    />
                                }
                                label={
                                    <Box>
                                        <Typography variant="body1">Weekly Digest</Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Get a weekly summary of your activity
                                        </Typography>
                                    </Box>
                                }
                            />
                        </Box>

                        <Divider sx={{ my: 3 }} />

                        <Typography variant="h6" sx={{ mb: 2 }}>
                            Push Notifications
                        </Typography>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={notifications.push}
                                    onChange={handleNotificationChange}
                                    name="push"
                                />
                            }
                            label={
                                <Box>
                                    <Typography variant="body1">Browser Notifications</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Show desktop notifications for important updates
                                    </Typography>
                                </Box>
                            }
                        />

                        <Box sx={{ mt: 3 }}>
                            <Button
                                variant="contained"
                                startIcon={<Save />}
                                onClick={handleSaveNotifications}
                            >
                                Save Preferences
                            </Button>
                        </Box>
                    </Box>
                </TabPanel>

                {/* Appearance Tab */}
                <TabPanel value={activeTab} index={2}>
                    <Box sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            Theme
                        </Typography>
                        <FormControlLabel
                            control={<Switch checked={mode === 'dark'} onChange={toggleTheme} />}
                            label={
                                <Box>
                                    <Typography variant="body1">Dark Mode</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Use dark theme across the application
                                    </Typography>
                                </Box>
                            }
                        />

                        <Divider sx={{ my: 3 }} />

                        <Typography variant="h6" sx={{ mb: 2 }}>
                            Language & Region
                        </Typography>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Language</InputLabel>
                                    <Select defaultValue="en" label="Language">
                                        <MenuItem value="en">English</MenuItem>
                                        <MenuItem value="es">Spanish</MenuItem>
                                        <MenuItem value="fr">French</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Timezone</InputLabel>
                                    <Select defaultValue="utc" label="Timezone">
                                        <MenuItem value="utc">UTC</MenuItem>
                                        <MenuItem value="ist">IST (India)</MenuItem>
                                        <MenuItem value="pst">PST (US)</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                    </Box>
                </TabPanel>

                {/* Security Tab */}
                <TabPanel value={activeTab} index={3}>
                    <Box sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            Change Password
                        </Typography>
                        <Alert severity="info" sx={{ mb: 3 }}>
                            Password must be at least 8 characters long and include uppercase, lowercase, and numbers.
                        </Alert>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    type="password"
                                    label="Current Password"
                                    name="currentPassword"
                                    value={security.currentPassword}
                                    onChange={handleSecurityChange}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    type="password"
                                    label="New Password"
                                    name="newPassword"
                                    value={security.newPassword}
                                    onChange={handleSecurityChange}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    type="password"
                                    label="Confirm New Password"
                                    name="confirmPassword"
                                    value={security.confirmPassword}
                                    onChange={handleSecurityChange}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleChangePassword}
                                >
                                    Update Password
                                </Button>
                            </Grid>
                        </Grid>

                        <Divider sx={{ my: 4 }} />

                        <Typography variant="h6" sx={{ mb: 2, color: 'error.main' }}>
                            Danger Zone
                        </Typography>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 2,
                                border: '1px solid',
                                borderColor: 'error.main',
                                bgcolor: mode === 'light' ? '#FFEBE6' : 'rgba(248, 113, 104, 0.1)'
                            }}
                        >
                            <Typography variant="body1" sx={{ mb: 1 }}>
                                Delete Account
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Once you delete your account, there is no going back. Please be certain.
                            </Typography>
                            <Button variant="outlined" color="error">
                                Delete My Account
                            </Button>
                        </Paper>
                    </Box>
                </TabPanel>
            </Paper>
        </Box>
    );
};

export default SettingsPage;
