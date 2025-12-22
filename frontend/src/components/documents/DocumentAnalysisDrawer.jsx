import { useState, useEffect } from 'react';
import {
    Box, Drawer, Typography, IconButton, TextField, Button,
    CircularProgress, Divider, Paper
} from '@mui/material';
import { Close, Send, AutoAwesome } from '@mui/icons-material';
import ReactMarkdown from 'react-markdown'; // Assuming react-markdown is installed or just standard text
import api from '../../services/api';

const DocumentAnalysisDrawer = ({ open, onClose, documentId, documentTitle }) => {
    const [loading, setLoading] = useState(false);
    const [summary, setSummary] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [question, setQuestion] = useState('');
    const [chatLoading, setChatLoading] = useState(false);

    useEffect(() => {
        if (open && documentId) {
            fetchAnalysis();
        } else {
            // Reset state on close
            setSummary('');
            setChatHistory([]);
            setQuestion('');
        }
    }, [open, documentId]);

    const fetchAnalysis = async () => {
        setLoading(true);
        try {
            const res = await api.post(`/rag/analyze/${documentId}`);
            setSummary(res.data.summary);
            setChatHistory([]); // Reset chat on new analysis or load
        } catch (error) {
            console.error(error);
            setSummary('Failed to analyze document.');
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async () => {
        if (!question.trim()) return;

        const currentQ = question;
        setQuestion('');
        setChatHistory(prev => [...prev, { role: 'user', content: currentQ }]);
        setChatLoading(true);

        try {
            const res = await api.post(`/rag/chat/${documentId}`, { question: currentQ });
            setChatHistory(prev => [...prev, { role: 'assistant', content: res.data.answer }]);
        } catch (error) {
            setChatHistory(prev => [...prev, { role: 'assistant', content: 'Error getting answer.' }]);
        } finally {
            setChatLoading(false);
        }
    };

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            PaperProps={{ sx: { width: { xs: '100%', md: 500 }, p: 3 } }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={700}>
                    AI Analysis: {documentTitle}
                </Typography>
                <IconButton onClick={onClose}><Close /></IconButton>
            </Box>

            <Divider sx={{ mb: 2 }} />

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress />
                    <Typography sx={{ ml: 2 }}>Analyzing Document...</Typography>
                </Box>
            ) : (
                <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

                    {/* Summary Section */}
                    <Box sx={{ mb: 4, overflow: 'auto', maxHeight: '40vh' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, color: '#4f46e5' }}>
                            <AutoAwesome sx={{ mr: 1 }} />
                            <Typography variant="subtitle1" fontWeight={600}>Summary</Typography>
                        </Box>
                        <Paper sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                {summary || "No summary available."}
                            </Typography>
                        </Paper>
                    </Box>

                    <Divider sx={{ mb: 2 }} />

                    {/* Chat Section */}
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                        Ask a Question
                    </Typography>

                    <Box sx={{ flexGrow: 1, overflow: 'auto', mb: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {chatHistory.map((msg, i) => (
                            <Box
                                key={i}
                                sx={{
                                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                    bgcolor: msg.role === 'user' ? 'primary.main' : 'rgba(0,0,0,0.05)',
                                    color: msg.role === 'user' ? 'white' : 'text.primary',
                                    p: 1.5,
                                    borderRadius: 2,
                                    maxWidth: '85%'
                                }}
                            >
                                <Typography variant="body2">{msg.content}</Typography>
                            </Box>
                        ))}
                        {chatLoading && (
                            <Box sx={{ alignSelf: 'flex-start', bgcolor: 'rgba(0,0,0,0.05)', p: 1.5, borderRadius: 2 }}>
                                <Typography variant="body2" fontStyle="italic">Thinking...</Typography>
                            </Box>
                        )}
                    </Box>

                    {/* Input */}
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Ask something about the document..."
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            disabled={chatLoading}
                        />
                        <Button
                            variant="contained"
                            onClick={handleSend}
                            disabled={chatLoading || !question.trim()}
                        >
                            <Send fontSize="small" />
                        </Button>
                    </Box>

                </Box>
            )}
        </Drawer>
    );
};

export default DocumentAnalysisDrawer;
