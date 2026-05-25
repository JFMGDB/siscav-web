"use client";

import React, { useState, useEffect } from "react";
import {
  Paper,
  Typography,
  Button,
  Box,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
} from "@mui/material";
import {
  Bluetooth as BluetoothIcon,
  BluetoothConnected as BluetoothConnectedIcon,
  Videocam as VideocamIcon,
  LinkOff as LinkOffIcon,
  Search as SearchIcon,
  Smartphone as SmartphoneIcon,
} from "@mui/icons-material";
import { getClientApiClient } from "@/lib/api/client";
import * as devicesApi from "@/lib/api/devices";
import { useSnackbar } from "@/hooks/use-snackbar";
import { MESSAGES } from "@/constants";

interface BluetoothDeviceInfo {
  id: string;
  name: string;
  device: BluetoothDevice; // Native Web Bluetooth device
}

export default function BluetoothDeviceManager() {
  const [connectedDevice, setConnectedDevice] =
    useState<BluetoothDeviceInfo | null>(null);
  const [availableDevices, setAvailableDevices] = useState<
    BluetoothDeviceInfo[]
  >([]);
  const [scanning, setScanning] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [scanDialogOpen, setScanDialogOpen] = useState(false);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const { showMessage } = useSnackbar();

  // Verificar suporte a Web Bluetooth API
  const isBluetoothSupported =
    typeof navigator !== "undefined" && "bluetooth" in navigator;

  useEffect(() => {
    if (!isBluetoothSupported) {
      showMessage(
        "Web Bluetooth API não é suportada neste navegador. Use Chrome, Edge ou Opera.",
        "error",
      );
    }
  }, [isBluetoothSupported, showMessage]);

  // Registrar dispositivo conectado no backend
  const registerDeviceWithBackend = async (device: BluetoothDevice) => {
    try {
      await devicesApi.connectDevice(getClientApiClient(), device.id);
      console.log("Dispositivo registrado no backend:", device.name);
    } catch (error) {
      console.warn("Falha ao registrar dispositivo no backend:", error);
    }
  };

  // Desregistrar dispositivo do backend
  const unregisterDeviceWithBackend = async () => {
    try {
      await devicesApi.disconnectDevice(getClientApiClient());
      console.log("Dispositivo desregistrado do backend");
    } catch (error) {
      console.warn("Falha ao desregistrar dispositivo do backend:", error);
    }
  };

  // Escanear dispositivos usando Web Bluetooth API
  const handleScanDevices = async () => {
    if (!isBluetoothSupported) {
      showMessage(MESSAGES.DEVICE.SCAN_ERROR, "error");
      return;
    }

    setScanning(true);
    showMessage("Procurando dispositivos Bluetooth...", "info");

    try {
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true, // Permite parear qualquer dispositivo (incluindo smartphones)
        optionalServices: [
          "battery_service",
          "device_information",
          "generic_access",
        ],
      });

      if (device) {
        const deviceInfo: BluetoothDeviceInfo = {
          id: device.id,
          name: device.name || "Dispositivo Desconhecido",
          device: device,
        };

        setAvailableDevices([deviceInfo]);
        setScanDialogOpen(true);
        showMessage(`Dispositivo encontrado: ${deviceInfo.name}`, "success");
      }
    } catch (error: unknown) {
      const err = error as { name?: string; message?: string };
      if (err.name === "NotFoundError") {
        showMessage("Nenhum dispositivo foi selecionado", "warning");
      } else {
        showMessage(MESSAGES.DEVICE.SCAN_ERROR, "error");
      }
    } finally {
      setScanning(false);
    }
  };

  // Conectar ao dispositivo selecionado
  const handleConnectDevice = async (deviceInfo: BluetoothDeviceInfo) => {
    setConnecting(true);
    showMessage(`Conectando a ${deviceInfo.name}...`, "info");

    try {
      const device = deviceInfo.device;

      // Conectar ao servidor GATT
      if (!device.gatt) {
        throw new Error("Dispositivo não suporta GATT");
      }

      const server = await device.gatt.connect();
      console.log("Conectado ao servidor GATT:", server);

      // Registrar no backend para coordenação
      await registerDeviceWithBackend(device);

      // Tentar obter stream de vídeo
      await requestVideoStream();

      setConnectedDevice(deviceInfo);
      setScanDialogOpen(false);
      showMessage(MESSAGES.DEVICE.CONNECT_SUCCESS, "success");

      // Listener para desconexão
      device.addEventListener(
        "gattserverdisconnected",
        handleDeviceDisconnected,
      );
    } catch {
      showMessage(MESSAGES.DEVICE.CONNECT_ERROR, "error");
    } finally {
      setConnecting(false);
    }
  };

  // Solicitar stream de vídeo
  const requestVideoStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment", // Câmera traseira
        },
      });

      setVideoStream(stream);
      console.log("Stream de vídeo obtido:", stream);
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.warn("Não foi possível obter stream de vídeo:", err.message);
      showMessage(
        "Dispositivo conectado, mas sem acesso ao vídeo. Verifique permissões.",
        "warning",
      );
    }
  };

  // Manipular desconexão do dispositivo
  const handleDeviceDisconnected = () => {
    showMessage(
      `Dispositivo ${connectedDevice?.name} foi desconectado`,
      "warning",
    );
    handleDisconnect();
  };

  // Desconectar dispositivo
  const handleDisconnect = async () => {
    if (!connectedDevice) return;

    try {
      // Desconectar GATT
      if (connectedDevice.device.gatt?.connected) {
        connectedDevice.device.gatt.disconnect();
      }

      // Parar stream de vídeo
      if (videoStream) {
        videoStream.getTracks().forEach((track) => track.stop());
        setVideoStream(null);
      }

      // Desregistrar do backend
      await unregisterDeviceWithBackend();

      // Remover listener
      connectedDevice.device.removeEventListener(
        "gattserverdisconnected",
        handleDeviceDisconnected,
      );

      setConnectedDevice(null);
      showMessage(MESSAGES.DEVICE.DISCONNECT_SUCCESS, "info");
    } catch {
      showMessage(MESSAGES.DEVICE.DISCONNECT_ERROR, "error");
    }
  };

  return (
    <Paper sx={{ p: 4, maxWidth: 1000, mx: "auto" }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <BluetoothIcon color="primary" sx={{ mr: 2, fontSize: 32 }} />
          <Typography variant="h5">
            Gerenciamento de Dispositivos Bluetooth
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={
            scanning ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <SearchIcon />
            )
          }
          onClick={handleScanDevices}
          disabled={scanning || !isBluetoothSupported || !!connectedDevice}
        >
          {scanning ? "Escaneando..." : "Procurar Dispositivo"}
        </Button>
      </Box>

      <Typography variant="body2" color="textSecondary" paragraph>
        Conecte um smartphone ou câmera via Bluetooth para captura de imagens de
        veículos.
      </Typography>

      {/* Instruções para Par eamento com Smartphone */}
      {!connectedDevice && isBluetoothSupported && (
        <Alert severity="info" icon={<SmartphoneIcon />} sx={{ mb: 3 }}>
          <strong>Como Parear Smartphone:</strong>
          <ol style={{ marginTop: 8, marginBottom: 0, paddingLeft: 20 }}>
            <li>Ative o Bluetooth no seu smartphone</li>
            <li>Clique em &quot;Procurar Dispositivo&quot; acima</li>
            <li>Selecione seu smartphone na lista do navegador</li>
            <li>Aceite a solicitação de pareamento em ambos os dispositivos</li>
            <li>Permita acesso à câmera quando solicitado</li>
          </ol>
        </Alert>
      )}

      {/*  Alerta de compatibilidade */}
      {!isBluetoothSupported && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <strong>Navegador Incompatível:</strong> Web Bluetooth API não está
          disponível.
          <br />
          Use Chrome, Edge ou Opera em um sistema com Bluetooth.
        </Alert>
      )}

      {/* Status de Conexão Atual */}
      {connectedDevice && (
        <Alert
          severity="success"
          icon={<BluetoothConnectedIcon />}
          action={
            <Button
              color="inherit"
              size="small"
              startIcon={<LinkOffIcon />}
              onClick={handleDisconnect}
            >
              Desconectar
            </Button>
          }
          sx={{ mb: 3 }}
        >
          <strong>Dispositivo Conectado:</strong> {connectedDevice.name}
          <Typography variant="caption" display="block">
            ID: {connectedDevice.id}
          </Typography>
          {videoStream && (
            <Chip
              icon={<VideocamIcon />}
              label="Stream de vídeo ativo"
              color="success"
              size="small"
              sx={{ mt: 1 }}
            />
          )}
        </Alert>
      )}

      {/* Preview de Vídeo */}
      {videoStream && (
        <Box sx={{ mt: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Preview da Câmera
          </Typography>
          <Box
            component="video"
            ref={(video: HTMLVideoElement | null) => {
              if (video && videoStream) {
                video.srcObject = videoStream;
                video.play();
              }
            }}
            autoPlay
            playsInline
            sx={{
              width: "100%",
              maxWidth: 640,
              height: "auto",
              borderRadius: 2,
              border: "2px solid",
              borderColor: "primary.main",
            }}
          />
        </Box>
      )}

      {/* Informações Técnicas */}
      {connectedDevice && (
        <Box sx={{ mt: 3, p: 2, bgcolor: "grey.100", borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            Informações do Dispositivo
          </Typography>
          <Table size="small">
            <TableBody>
              <TableRow>
                <TableCell>
                  <strong>Nome:</strong>
                </TableCell>
                <TableCell>{connectedDevice.name}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <strong>ID:</strong>
                </TableCell>
                <TableCell
                  sx={{ fontFamily: "monospace", fontSize: "0.875rem" }}
                >
                  {connectedDevice.id}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <strong>Status GATT:</strong>
                </TableCell>
                <TableCell>
                  {connectedDevice.device.gatt?.connected ? (
                    <Chip label="Conectado" color="success" size="small" />
                  ) : (
                    <Chip label="Desconectado" color="default" size="small" />
                  )}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <strong>Stream de Vídeo:</strong>
                </TableCell>
                <TableCell>
                  {videoStream ? (
                    <Chip label="Ativo" color="success" size="small" />
                  ) : (
                    <Chip label="Inativo" color="default" size="small" />
                  )}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Box>
      )}

      {/* Dialog de Seleção de Dispositivo */}
      <Dialog open={scanDialogOpen} onClose={() => setScanDialogOpen(false)}>
        <DialogTitle>Selecionar Dispositivo Bluetooth</DialogTitle>
        <DialogContent>
          <List>
            {availableDevices.map((deviceInfo) => (
              <ListItem key={deviceInfo.id} disablePadding>
                <ListItemButton
                  onClick={() => handleConnectDevice(deviceInfo)}
                  disabled={connecting}
                >
                  <BluetoothIcon sx={{ mr: 2 }} />
                  <ListItemText
                    primary={deviceInfo.name}
                    secondary={`ID: ${deviceInfo.id}`}
                  />
                  {connecting && <CircularProgress size={24} />}
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScanDialogOpen(false)}>Cancelar</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
