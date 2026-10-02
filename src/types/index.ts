// Tipos de domínio do sistema Mansão Maromba.
// Mantidos independentes da camada de armazenamento para facilitar a
// migração futura para Supabase/PostgreSQL.

export type ID = string;

export type StudentStatus = 'ativo' | 'inativo' | 'bloqueado';
/** Status calculado (considera vencimento da mensalidade). */
export type StudentDisplayStatus = 'ativo' | 'vencido' | 'inativo' | 'bloqueado';
export type StudentOrigin = 'mansao' | 'wellhub' | 'totalpass';

export type PaymentMethod = 'pix' | 'dinheiro' | 'credito' | 'debito';

export interface Student {
  id: ID;
  matricula: string;
  name: string;
  cpf: string;
  birthDate: string;
  phone: string;
  whatsapp: string;
  email: string;
  cep: string;
  address: string;
  number: string;
  district: string;
  city: string;
  state: string;
  emergencyContact: string;
  planId: ID | null;
  enrollmentDate: string; // yyyy-mm-dd
  dueDate: string; // yyyy-mm-dd
  paymentMethod: PaymentMethod;
  notes: string;
  photo?: string;
  status: StudentStatus;
  blockReason?: string;
  origin: StudentOrigin;
  biometry: boolean;
  biometryRegisteredAt?: string;
  lastAccess?: string; // ISO
  createdAt: string; // ISO
}

export type StudentInput = Omit<
  Student,
  'id' | 'matricula' | 'createdAt' | 'biometry' | 'lastAccess' | 'status'
> & { status?: StudentStatus };

export interface Plan {
  id: ID;
  name: string;
  price: number;
  durationMonths: number;
  benefits: string[];
  active: boolean;
  highlight?: boolean;
}

export type PaymentStatus = 'pago' | 'pendente' | 'vencido';

export interface Payment {
  id: ID;
  studentId: ID;
  planId: ID | null;
  amount: number;
  dueDate: string; // yyyy-mm-dd
  paidAt?: string; // ISO
  method?: PaymentMethod;
}

export type AccessOrigin = 'biometria' | 'wellhub' | 'totalpass' | 'manual' | 'recepcao';
export type AccessResult = 'liberado' | 'bloqueado';

export interface AccessLog {
  id: ID;
  studentId: ID | null;
  studentName: string;
  timestamp: string; // ISO
  gate: string;
  origin: AccessOrigin;
  result: AccessResult;
  reason?: string;
  /** Preenchido quando o administrador liberou manualmente. */
  manualReason?: string;
}

export type EmployeeRole = 'Administrador' | 'Gerente' | 'Recepcionista' | 'Professor' | 'Financeiro';

export interface Employee {
  id: ID;
  name: string;
  role: EmployeeRole;
  phone: string;
  email: string;
  active: boolean;
  photo?: string;
}

export type NotificationKind = 'info' | 'success' | 'warning' | 'danger';

export interface AppNotification {
  id: ID;
  title: string;
  message: string;
  kind: NotificationKind;
  createdAt: string;
  read: boolean;
}

/**
 * Valores que representam o restante da base da academia (alunos não
 * detalhados nos dados de demonstração), para que os indicadores do painel
 * reflitam uma academia com ~500 alunos.
 */
export interface DemoBaseline {
  activeStudents: number;
  checkinsToday: number;
  pendingPayments: number;
  revenueMonth: number;
  revenueToday: number;
  receivable: number;
  newStudents: number;
  blockedAccesses: number;
  checkinsWellhub: number;
  checkinsTotalpass: number;
}

export interface GymSettings {
  gymName: string;
  cnpj: string;
  phone: string;
  email: string;
  address: string;
  graceDays: number;
  autoBlockOverdue: boolean;
  soundOnAccess: boolean;
}

export interface Database {
  version: number;
  students: Student[];
  plans: Plan[];
  payments: Payment[];
  accessLogs: AccessLog[];
  employees: Employee[];
  notifications: AppNotification[];
  baseline: DemoBaseline;
  settings: GymSettings;
  nextMatricula: number;
}
