import WhitelistTable from '@/components/features/whitelist/Whitelist-Table';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Veículos Autorizados - SISCAV',
  description: 'Gerenciar veículos autorizados',
};

export default function WhitelistPage() {
  return <WhitelistTable />;
}
