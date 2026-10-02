// CHECK-IN TOTALPASS — SIMULAÇÃO PARA DEMONSTRAÇÃO.
// Nenhuma chamada à API do TotalPass é realizada nesta versão.
import { PartnerCheckinPage } from '@/components/admin/PartnerCheckin';
import { totalpass } from '@/services/integrations';

export default function TotalPass() {
  return <PartnerCheckinPage provider={totalpass} />;
}
