'use client';

import React, { useState } from 'react';
import { Box, Grid, Typography, Container } from '@mui/material';
import CameraFeed from '@/components/features/monitor/CameraFeed';
import PlateRecognitionDisplay from '@/components/features/monitor/PlateRecognitionDisplay';
import ManualRegistrationForm from '@/components/features/monitor/ManualRegistrationForm';

export default function MonitorPage() {
    const [unknownPlate, setUnknownPlate] = useState<string>('');

    const handleUnknownPlate = (plate: string) => {
        setUnknownPlate(plate);
    };

    const handleRegistrationSuccess = () => {
        setUnknownPlate('');
    };

    return (
        <Container maxWidth="xl">
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Monitoramento de Acesso
                </Typography>
                <Typography variant="body1" color="textSecondary">
                    Visualize o fluxo de veículos e gerencie acessos em tempo real.
                </Typography>
            </Box>

            <Grid container spacing={3}>
                {/* Camera Feed Section */}
                <Grid size={{ xs: 12, lg: 8 }}>
                    <CameraFeed />
                </Grid>

                {/* Sidebar Section */}
                <Grid size={{ xs: 12, lg: 4 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, height: '100%' }}>
                        {/* Recognition Display */}
                        <Box sx={{ flex: 1 }}>
                            <PlateRecognitionDisplay onUnknownPlate={handleUnknownPlate} />
                        </Box>

                        {/* Manual Registration Form */}
                        <Box sx={{ flex: 1 }}>
                            <ManualRegistrationForm
                                initialPlate={unknownPlate}
                                onSuccess={handleRegistrationSuccess}
                            />
                        </Box>
                    </Box>
                </Grid>
            </Grid>
        </Container>
    );
}
