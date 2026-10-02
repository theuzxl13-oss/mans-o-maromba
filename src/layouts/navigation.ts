import {
  Activity,
  BarChart3,
  CalendarCheck,
  DoorOpen,
  Fingerprint,
  Handshake,
  LayoutDashboard,
  Receipt,
  ScanLine,
  Settings,
  Ticket,
  UserCog,
  UserPlus,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  end?: boolean;
}
export interface NavGroup {
  title: string;
  items: NavItem[];
}

export const navigation: NavGroup[] = [
  {
    title: 'Principal',
    items: [
      { label: 'Dashboard', to: '/admin', icon: LayoutDashboard, end: true },
      { label: 'Alunos', to: '/admin/alunos', icon: Users, end: true },
      { label: 'Novo Aluno', to: '/admin/alunos/novo', icon: UserPlus },
      { label: 'Planos', to: '/admin/planos', icon: Ticket },
      { label: 'Mensalidades', to: '/admin/mensalidades', icon: Receipt },
      { label: 'Check-ins', to: '/admin/checkins', icon: CalendarCheck },
    ],
  },
  {
    title: 'Acesso',
    items: [
      { label: 'Controle de Acesso', to: '/admin/controle-acesso', icon: DoorOpen },
      { label: 'Catraca', to: '/admin/catraca', icon: Activity },
      { label: 'Biometria', to: '/admin/biometria', icon: Fingerprint },
      { label: 'Wellhub', to: '/admin/wellhub', icon: ScanLine },
      { label: 'TotalPass', to: '/admin/totalpass', icon: Handshake },
    ],
  },
  {
    title: 'Gestão',
    items: [
      { label: 'Financeiro', to: '/admin/financeiro', icon: Wallet },
      { label: 'Funcionários', to: '/admin/funcionarios', icon: UserCog },
      { label: 'Relatórios', to: '/admin/relatorios', icon: BarChart3 },
      { label: 'Configurações', to: '/admin/configuracoes', icon: Settings },
    ],
  },
];

export const pageTitles: Record<string, string> = Object.fromEntries(
  navigation.flatMap((g) => g.items.map((i) => [i.to, i.label])),
);
