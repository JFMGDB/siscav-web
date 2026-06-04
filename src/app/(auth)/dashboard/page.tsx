import { Typography, Grid, Box } from "@mui/material";
import GateControl from "@/components/features/gate/GateControl";

export default function DashboardPage() {
  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Painel de Controle
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Controle de acesso veicular
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <GateControl />
        </Grid>
      </Grid>
    </Box>
  );
}
