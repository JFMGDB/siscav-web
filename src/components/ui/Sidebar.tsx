'use client';

/**
 * Sidebar Moderna
 * 
 * Refatoração com design moderno:
 * - Logo e branding melhorados
 * - Navegação com estados visuais claros
 * - Perfil do usuário destacado
 * - Design limpo e contemporâneo
 * 
 * Decisões:
 * - Mantém funcionalidade existente
 * - Melhora feedback visual
 * - Adiciona microinterações
 */

import React from 'react';
import {
    Box,
    Drawer,
    AppBar,
    Toolbar,
    List,
    Typography,
    Divider,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    IconButton,
    Avatar,
    Chip,
    Badge,
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    DirectionsCar as CarIcon,
    History as HistoryIcon,
    ExitToApp as LogoutIcon,
    Menu as MenuIcon,
    Videocam as VideocamIcon,
    CameraAlt as CameraAltIcon,
    Settings as SettingsIcon,
    Notifications as NotificationsIcon,
} from '@mui/icons-material';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { ROUTES, UI_CONFIG } from '@/constants';

const drawerWidth = UI_CONFIG.DRAWER.WIDTH;

export default function Sidebar({ children }: { children: React.ReactNode }) {
    const { logout, user } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = React.useState(false);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const menuItems = [
        { text: 'Painel', icon: <DashboardIcon />, path: ROUTES.AUTH.DASHBOARD },
        { text: 'Monitoramento', icon: <VideocamIcon />, path: ROUTES.AUTH.MONITOR },
        { text: 'Pré-visualização', icon: <CameraAltIcon />, path: ROUTES.AUTH.CAMERA },
        { text: 'Veículos Autorizados', icon: <CarIcon />, path: ROUTES.AUTH.WHITELIST },
        { text: 'Histórico de Acesso', icon: <HistoryIcon />, path: ROUTES.AUTH.LOGS },
        { text: 'Configurações', icon: <SettingsIcon />, path: ROUTES.AUTH.SETTINGS },
    ];

    const drawer = (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Logo Section */}
            <Toolbar
                sx={{
                    minHeight: '80px !important',
                    borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                    background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
                    <Box
                        sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 2,
                            background: 'rgba(255, 255, 255, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 700,
                            fontSize: '1.25rem',
                        }}
                    >
                        S
                    </Box>
                    <Box>
                        <Typography variant="h6" sx={{ color: 'white', fontWeight: 700, lineHeight: 1.2 }}>
                            SISCAV
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.7rem' }}>
                            Sistema de Controle
                        </Typography>
                    </Box>
                </Box>
            </Toolbar>

            {/* Navigation */}
            <Box sx={{ flex: 1, overflow: 'auto', py: 2 }}>
                <List sx={{ px: 1 }}>
                    {menuItems.map((item) => {
                        const isSelected = pathname === item.path;
                        return (
                            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                                <ListItemButton
                                    selected={isSelected}
                                    onClick={() => router.push(item.path)}
                                    sx={{
                                        borderRadius: 2,
                                        py: 1.5,
                                        transition: 'all 0.2s ease-in-out',
                                        '&.Mui-selected': {
                                            backgroundColor: 'rgba(37, 99, 235, 0.1)',
                                            color: 'primary.main',
                                            '&:hover': {
                                                backgroundColor: 'rgba(37, 99, 235, 0.15)',
                                            },
                                            '& .MuiListItemIcon-root': {
                                                color: 'primary.main',
                                            },
                                        },
                                    }}
                                >
                                    <ListItemIcon
                                        sx={{
                                            minWidth: 40,
                                            color: isSelected ? 'primary.main' : 'text.secondary',
                                        }}
                                    >
                                        {item.icon}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={item.text}
                                        primaryTypographyProps={{
                                            fontWeight: isSelected ? 600 : 400,
                                            fontSize: '0.9375rem',
                                        }}
                                    />
                                </ListItemButton>
                            </ListItem>
                        );
                    })}
                </List>
            </Box>

            {/* User Section */}
            <Box sx={{ borderTop: '1px solid rgba(0, 0, 0, 0.05)', p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                    <Avatar
                        sx={{
                            width: 40,
                            height: 40,
                            bgcolor: 'primary.main',
                            fontSize: '1rem',
                            fontWeight: 600,
                        }}
                    >
                        {user?.name?.charAt(0).toUpperCase() || 'A'}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                            {user?.name || 'Admin'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                            {user?.email || 'admin@siscav.com'}
                        </Typography>
                    </Box>
                </Box>
                <ListItemButton
                    onClick={logout}
                    sx={{
                        borderRadius: 2,
                        color: 'error.main',
                        '&:hover': {
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        },
                    }}
                >
                    <ListItemIcon sx={{ minWidth: 40, color: 'error.main' }}>
                        <LogoutIcon />
                    </ListItemIcon>
                    <ListItemText
                        primary="Sair"
                        primaryTypographyProps={{
                            fontWeight: 500,
                            fontSize: '0.9375rem',
                        }}
                    />
                </ListItemButton>
            </Box>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
            <AppBar
                position="fixed"
                sx={{
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    ml: { sm: `${drawerWidth}px` },
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                }}
            >
                <Toolbar sx={{ px: { xs: 2, sm: 3 } }}>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { sm: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
                        {menuItems.find((item) => item.path === pathname)?.text || 'Painel'}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <IconButton size="small" sx={{ color: 'text.secondary' }}>
                            <Badge badgeContent={0} color="error">
                                <NotificationsIcon />
                            </Badge>
                        </IconButton>
                        <Chip
                            label="Online"
                            color="success"
                            size="small"
                            sx={{ fontWeight: 500 }}
                        />
                    </Box>
                </Toolbar>
            </AppBar>
            <Box
                component="nav"
                sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
                aria-label="navigation"
            >
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true,
                    }}
                    sx={{
                        display: { xs: 'block', sm: 'none' },
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: drawerWidth,
                        },
                    }}
                >
                    {drawer}
                </Drawer>
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', sm: 'block' },
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: drawerWidth,
                        },
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: { xs: 2, sm: 3 },
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    bgcolor: 'background.default',
                }}
            >
                <Toolbar />
                {children}
            </Box>
        </Box>
    );
}
