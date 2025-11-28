'use client';

import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, Alert, CircularProgress } from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import { apiClient } from '@/lib/api-client';

interface TrainingFormProps {
    onUploadSuccess: () => void;
}

export default function TrainingForm({ onUploadSuccess }: TrainingFormProps) {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [label, setLabel] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !label) {
            setMessage({ text: 'Por favor, selecione uma imagem e insira a placa.', type: 'error' });
            return;
        }

        setLoading(true);
        setMessage(null);

        try {
            await apiClient.uploadTrainingData(file, label);
            setMessage({ text: 'Dados de treinamento enviados com sucesso!', type: 'success' });
            setFile(null);
            setPreview(null);
            setLabel('');
            onUploadSuccess();
        } catch (error) {
            setMessage({ text: 'Erro ao enviar dados.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
                Adicionar Dados de Treinamento
            </Typography>

            {message && <Alert severity={message.type} sx={{ mb: 2 }}>{message.text}</Alert>}

            <form onSubmit={handleSubmit}>
                <Box sx={{ mb: 2, textAlign: 'center' }}>
                    <input
                        accept="image/*"
                        style={{ display: 'none' }}
                        id="raised-button-file"
                        type="file"
                        onChange={handleFileChange}
                    />
                    <label htmlFor="raised-button-file">
                        <Button variant="outlined" component="span" startIcon={<CloudUploadIcon />}>
                            Selecionar Imagem
                        </Button>
                    </label>
                    {preview && (
                        <Box sx={{ mt: 2 }}>
                            <img src={preview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '200px' }} />
                        </Box>
                    )}
                </Box>

                <TextField
                    label="Placa (Label)"
                    fullWidth
                    value={label}
                    onChange={(e) => setLabel(e.target.value.toUpperCase())}
                    margin="normal"
                    required
                />

                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    disabled={loading || !file || !label}
                    sx={{ mt: 2 }}
                >
                    {loading ? <CircularProgress size={24} /> : 'Enviar para Treinamento'}
                </Button>
            </form>
        </Paper>
    );
}
