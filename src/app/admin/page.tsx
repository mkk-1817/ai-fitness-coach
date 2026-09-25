import { AdminDashboard } from '@/components/admin/AdminDashboard';

export const metadata = {
  title: 'Admin Management | AuraFit Coach',
  description: 'Manage exercise library, food catalog, AI models, and database schema.',
};

export default function AdminPage() {
  return <AdminDashboard />;
}
