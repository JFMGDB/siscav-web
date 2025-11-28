import WhitelistTable from '@/components/features/whitelist/Whitelist-Table';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Whitelist - SISCAV',
  description: 'Manage authorized vehicles',
};

export default function WhitelistPage() {
  return <WhitelistTable />;
}
