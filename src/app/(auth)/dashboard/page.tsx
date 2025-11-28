'use client';

import { Typography, Grid, Paper, Box } from '@mui/material';
import GateControl from '@/components/features/gate/Gate-Control';

export default function DashboardPage() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Painel de Controle
      </Typography>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="h6" color="primary">
              Status do Sistema
            </Typography>
            <Typography variant="h3">
              Online
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="h6" color="primary">
              Veículos Autorizados
            </Typography>
            <Typography variant="h3">
              124
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="h6" color="primary">
              Acessos de Hoje
            </Typography>
            <Typography variant="h3">
              45
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <GateControl />
        </Grid>
      </Grid>
    </Box>
  );
}
