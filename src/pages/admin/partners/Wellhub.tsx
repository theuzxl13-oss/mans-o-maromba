// CHECK-IN WELLHUB — SIMULAÇÃO PARA DEMONSTRAÇÃO.
// Nenhuma chamada à API do Wellhub é realizada nesta versão.
import { PartnerCheckinPage } from '@/components/admin/PartnerCheckin';
import { wellhub } from '@/services/integrations';

export default function Wellhub() {
  return <PartnerCheckinPage provider={wellhub} />;
}
