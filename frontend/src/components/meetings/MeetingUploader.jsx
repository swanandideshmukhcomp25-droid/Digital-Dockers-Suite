import { useState } from 'react';
import { Box, Button, Typography, Paper, LinearProgress } from '@mui/material';
import { useDropzone } from 'react-dropzone';
import { CloudUpload } from '@mui/icons-material';
import api from '../../services/api';
import { toast } from 'react-toastify';

const MeetingUploader = ({ onUploadSuccess }) => {
    const [uploading, setUploading] = useState(false);

    const onDrop = async (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', file.name.replace(/\.[^/.]+$/, "")); // Default title from filename

        setUploading(true);
        try {
            const res = await api.post('/meetings/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Trigger processing immediately (or let backend handle it)
            await api.post(`/meetings/${res.data._id}/process`);

            toast.success('Meeting uploaded and processing started!');
            if (onUploadSuccess) onUploadSuccess();
        } catch (error) {
            console.error(error);
            toast.error('Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'audio/*': [], 'video/*': [] },
        maxFiles: 1
    });

    return (
        <Paper
            {...getRootProps()}
            sx={{
                p: 3,
                border: '2px dashed #ccc',
                textAlign: 'center',
                cursor: 'pointer',
                bgcolor: isDragActive ? '#f0f8ff' : 'background.paper'
            }}
        >
            <input {...getInputProps()} />
            <CloudUpload sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
            <Typography variant="h6">
                {isDragActive ? 'Drop the meeting recording here' : 'Drag & drop meeting recording'}
            </Typography>
            <Typography variant="body2" color="textSecondary">
                or click to select file
            </Typography>
            {uploading && <LinearProgress sx={{ mt: 2 }} />}
        </Paper>
    );
};

export default MeetingUploader;
