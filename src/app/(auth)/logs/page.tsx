import LogsTable from '@/components/features/logs/Logs-Table';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Access Logs - SISCAV',
  description: 'View vehicle access history',
};

export default function LogsPage() {
  return <LogsTable />;
}
