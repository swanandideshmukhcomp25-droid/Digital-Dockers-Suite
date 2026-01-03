import { useState, useEffect } from 'react';
import {
    Box, Grid, Paper, Typography, Button, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Chip, IconButton
} from '@mui/material';
import { UploadFile, Visibility, AutoAwesome } from '@mui/icons-material';
import api from '../../services/api';
import { toast } from 'react-toastify';
import DocumentAnalysisDrawer from './DocumentAnalysisDrawer';

const DocumentManager = () => {
    const [documents, setDocuments] = useState([]);
    const [analysisOpen, setAnalysisOpen] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState(null);

    const fetchDocuments = async () => {
        try {
            const res = await api.get('/documents');
            setDocuments(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchDocuments();
    }, []);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'contract');

        try {
            // Send with multipart/form-data (axios auto-sets this for FormData)
            await api.post('/documents/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            toast.success('Document uploaded successfully');
            fetchDocuments();
        } catch (error) {
            console.error('Upload error:', error);
            toast.error(error.response?.data?.message || 'Upload failed');
        }
    };

    const handleAnalyze = (doc) => {
        setSelectedDoc(doc);
        setAnalysisOpen(true);
    };

    const handleCloseAnalysis = () => {
        setAnalysisOpen(false);
        setSelectedDoc(null);
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h5">Document Vault</Typography>
                <Button variant="contained" component="label" startIcon={<UploadFile />}>
                    Upload Document
                    <input type="file" hidden onChange={handleFileUpload} />
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Title</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {documents.map((doc) => (
                            <TableRow key={doc._id}>
                                <TableCell>{doc.title}</TableCell>
                                <TableCell>{doc.type}</TableCell>
                                <TableCell>
                                    <Chip label={doc.status} size="small" />
                                </TableCell>
                                <TableCell>
                                    <Button
                                        size="small"
                                        startIcon={<Visibility />}
                                        sx={{ mr: 1 }}
                                        href={`http://localhost:5000/${doc.file?.filepath}`} // Simple link for now
                                        target="_blank"
                                    >
                                        View
                                    </Button>
                                    <Button
                                        size="small"
                                        startIcon={<AutoAwesome />}
                                        color="secondary"
                                        onClick={() => handleAnalyze(doc)}
                                    >
                                        Analyze AI
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {selectedDoc && (
                <DocumentAnalysisDrawer
                    open={analysisOpen}
                    onClose={handleCloseAnalysis}
                    documentId={selectedDoc._id}
                    documentTitle={selectedDoc.title}
                />
            )}
        </Box>
    );
};

export default DocumentManager;
