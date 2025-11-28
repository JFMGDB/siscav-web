'use client';

import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Card, CardMedia, CardContent, Chip, CircularProgress } from '@mui/material';
import { apiClient, TrainingData } from '@/lib/api-client';

interface TrainingListProps {
    refreshTrigger: number;
}

export default function TrainingList({ refreshTrigger }: TrainingListProps) {
    const [data, setData] = useState<TrainingData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const result = await apiClient.getTrainingData();
                setData(result);
            } catch (error) {
                console.error('Failed to fetch training data', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [refreshTrigger]);

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>;
    }

    if (data.length === 0) {
        return <Typography align="center">Nenhum dado de treinamento encontrado.</Typography>;
    }

    return (
        <Box>
            <Typography variant="h6" gutterBottom>
                Dados de Treinamento Existentes
            </Typography>
            <Grid container spacing={2}>
                {data.map((item) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.id}>
                        <Card>
                            <CardMedia
                                component="img"
                                height="140"
                                image={item.imageUrl}
                                alt={item.label}
                                sx={{ bgcolor: '#f0f0f0', objectFit: 'contain' }}
                            />
                            <CardContent>
                                <Typography variant="subtitle1" component="div">
                                    Label: <Chip label={item.label} color="primary" size="small" />
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Adicionado em: {new Date(item.createdAt).toLocaleDateString('pt-BR')}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}
