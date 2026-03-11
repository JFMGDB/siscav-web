'use client';

import React from 'react';
import { Container, Box, Typography } from '@mui/material';
import BluetoothDeviceManager from '@/components/features/settings/BluetoothDeviceManager';

export default function SettingsPage() {
    return (
        <Container maxWidth="lg">
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Configurações do Sistema
                </Typography>
                <Typography variant="body1" color="textSecondary">
                    Gerencie dispositivos Bluetooth conectados e configurações globais.
                </Typography>
            </Box>

            <BluetoothDeviceManager />
        </Container>
    );
}
