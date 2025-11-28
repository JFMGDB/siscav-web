import { Metadata } from 'next';
import TrainingManager from '@/components/features/training/Training-Manager';

export const metadata: Metadata = {
    title: 'Treinamento IA - SISCAV',
    description: 'Alimentar modelo de IA com novos dados',
};

export default function TrainingPage() {
    return <TrainingManager />;
}
