import { useState } from 'react';
import {
    Box, Typography, Slider, RadioGroup, FormControlLabel,
    Radio, Button, Paper, Alert
} from '@mui/material';
import api from '../../services/api';

const WellnessCheckin = () => {
    const [stress, setStress] = useState(5);
    const [mood, setMood] = useState('neutral');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async () => {
        try {
            await api.post('/wellness/checkin', {
                responses: {
                    stressLevel: stress,
                    mood: mood,
                }
            });
            setSubmitted(true);
        } catch (error) {
            console.error(error);
        }
    };

    if (submitted) {
        return <Alert severity="success">Thanks for checking in! Take care of yourself.</Alert>;
    }

    return (
        <Paper sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
            <Typography variant="h5" gutterBottom>Daily Wellness Check-in</Typography>

            <Typography gutterBottom sx={{ mt: 3 }}>Stress Level (1-10)</Typography>
            <Slider
                value={stress}
                onChange={(_, val) => setStress(val)}
                min={1}
                max={10}
                valueLabelDisplay="auto"
                marks
            />

            <Typography gutterBottom sx={{ mt: 3 }}>Current Mood</Typography>
            <RadioGroup row value={mood} onChange={(e) => setMood(e.target.value)}>
                <FormControlLabel value="excellent" control={<Radio color="success" />} label="Excellent" />
                <FormControlLabel value="good" control={<Radio color="primary" />} label="Good" />
                <FormControlLabel value="neutral" control={<Radio color="default" />} label="Neutral" />
                <FormControlLabel value="stressed" control={<Radio color="warning" />} label="Stressed" />
                <FormControlLabel value="burnout" control={<Radio color="error" />} label="Burnout" />
            </RadioGroup>

            <Button
                variant="contained"
                fullWidth
                sx={{ mt: 4 }}
                onClick={handleSubmit}
            >
                Submit Check-in
            </Button>
        </Paper>
    );
};

export default WellnessCheckin;
