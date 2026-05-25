'use client';

/**
 * Dashboard Moderno
 * 
 * Refatoração com design moderno:
 * - Usa StatCard para métricas visuais
 * - Layout responsivo melhorado
 * - Visual mais limpo e profissional
 * 
 * Decisões:
 * - Reutiliza componentes UI base (DRY)
 * - Layout em grid responsivo
 * - Métricas destacadas visualmente
 */

import { Typography, Grid, Box } from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  DirectionsCar as CarIcon,
  TrendingUp as TrendingUpIcon,
  LockOpen as LockOpenIcon,
} from '@mui/icons-material';
import { StatCard } from '@/components/ui/StatCard';
import GateControl from '@/components/features/gate/GateControl';

export default function DashboardPage() {
  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Painel de Controle
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Visão geral do sistema de controle de acesso veicular
        </Typography>
      </Box>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Status do Sistema"
            value="Online"
            icon={<CheckCircleIcon sx={{ fontSize: 40 }} />}
            color="success"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Veículos Autorizados"
            value={124}
            icon={<CarIcon sx={{ fontSize: 40 }} />}
            color="primary"
            trend={{ value: 12, label: 'este mês', positive: true }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Acessos Hoje"
            value={45}
            icon={<TrendingUpIcon sx={{ fontSize: 40 }} />}
            color="info"
            trend={{ value: 8, label: 'vs ontem', positive: true }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Taxa de Sucesso"
            value="98.5%"
            icon={<CheckCircleIcon sx={{ fontSize: 40 }} />}
            color="success"
          />
        </Grid>
      </Grid>

      {/* Actions Grid */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <GateControl />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          {/* Placeholder for future quick actions or recent activity */}
        </Grid>
      </Grid>
    </Box>
  );
}
