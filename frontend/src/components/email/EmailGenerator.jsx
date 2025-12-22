import { useState } from 'react';
import {
    Box, TextField, Button, Typography, Paper, Grid,
    FormControl, InputLabel, Select, MenuItem, CircularProgress
} from '@mui/material';
import { Send, AutoFixHigh } from '@mui/icons-material';
import api from '../../services/api';
import { toast } from 'react-toastify';

const EmailGenerator = () => {
    const [input, setInput] = useState({
        bulletPoints: '',
        context: '',
        tone: 'formal',
        recipients: ''
    });
    const [generatedEmail, setGeneratedEmail] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const res = await api.post('/emails/generate', {
                ...input,
                bulletPoints: input.bulletPoints.split('\n'),
                recipients: input.recipients.split(',')
            });
            setGeneratedEmail(res.data.generatedContent);
            toast.success('Email generated!');
        } catch (error) {
            console.error(error);
            toast.error('Generation failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>Email Details</Typography>
                    <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            label="Key Points (one per line)"
                            multiline
                            rows={4}
                            value={input.bulletPoints}
                            onChange={(e) => setInput({ ...input, bulletPoints: e.target.value })}
                            fullWidth
                        />
                        <TextField
                            label="Context / Purpose"
                            multiline
                            rows={2}
                            value={input.context}
                            onChange={(e) => setInput({ ...input, context: e.target.value })}
                            fullWidth
                        />
                        <FormControl fullWidth>
                            <InputLabel>Tone</InputLabel>
                            <Select
                                value={input.tone}
                                label="Tone"
                                onChange={(e) => setInput({ ...input, tone: e.target.value })}
                            >
                                <MenuItem value="formal">Formal</MenuItem>
                                <MenuItem value="casual">Casual</MenuItem>
                                <MenuItem value="persuasive">Persuasive</MenuItem>
                                <MenuItem value="friendly">Friendly</MenuItem>
                                <MenuItem value="urgent">Urgent</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField
                            label="Recipients (comma separated)"
                            value={input.recipients}
                            onChange={(e) => setInput({ ...input, recipients: e.target.value })}
                            fullWidth
                        />
                        <Button
                            variant="contained"
                            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AutoFixHigh />}
                            onClick={handleGenerate}
                            disabled={loading}
                        >
                            Generate Email
                        </Button>
                    </Box>
                </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, height: '100%' }}>
                    <Typography variant="h6" gutterBottom>Preview</Typography>
                    {generatedEmail ? (
                        <Box sx={{ border: '1px solid #ddd', p: 2, borderRadius: 1 }}>
                            <Typography variant="subtitle2" color="textSecondary">Subject:</Typography>
                            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                                {generatedEmail.subject}
                            </Typography>
                            <Typography variant="subtitle2" color="textSecondary" sx={{ mt: 2 }}>Body:</Typography>
                            <Typography variant="body1" style={{ whiteSpace: 'pre-line' }}>
                                {generatedEmail.body}
                            </Typography>
                            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                                <Button
                                    variant="contained"
                                    color="success"
                                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Send />}
                                    onClick={async () => {
                                        setLoading(true);
                                        try {
                                            await api.post('/emails/send', {
                                                to: input.recipients,
                                                subject: generatedEmail.subject,
                                                body: generatedEmail.body
                                            });
                                            toast.success('Email sent successfully!');
                                        } catch (error) {
                                            console.error(error);
                                            toast.error('Failed to send email. Check connection.');
                                        } finally {
                                            setLoading(false);
                                        }
                                    }}
                                    disabled={loading}
                                >
                                    Send Now
                                </Button>
                            </Box>
                        </Box>
                    ) : (
                        <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
                            <Typography>Generated email will appear here.</Typography>
                        </Box>
                    )}
                </Paper>
            </Grid>
        </Grid>
    );
};

export default EmailGenerator;
