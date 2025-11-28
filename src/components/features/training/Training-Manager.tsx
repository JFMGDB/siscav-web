'use client';

import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import TrainingForm from '@/components/features/training/Training-Form';
import TrainingList from '@/components/features/training/Training-List';

export default function TrainingManager() {
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleUploadSuccess = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Treinamento de IA
            </Typography>
            <Typography variant="body1" paragraph>
                Utilize esta página para alimentar o modelo de IA com novos dados de treinamento.
                Envie imagens de veículos e identifique a placa correspondente.
            </Typography>

            <TrainingForm onUploadSuccess={handleUploadSuccess} />

            <Box sx={{ mt: 4 }}>
                <TrainingList refreshTrigger={refreshTrigger} />
            </Box>
        </Box>
    );
}
