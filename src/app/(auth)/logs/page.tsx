import LogsTable from '@/components/features/logs/Logs-Table';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Histórico de Acesso - SISCAV',
  description: 'Visualizar histórico de acesso de veículos',
};

export default function LogsPage() {
  return <LogsTable />;
}
