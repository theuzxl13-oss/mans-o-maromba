// DADOS FICTÍCIOS PARA DEMONSTRAÇÃO.
// Gerados de forma relativa à data atual para que o painel sempre
// pareça "vivo" durante uma apresentação.

import type {
  AccessLog,
  AccessOrigin,
  AppNotification,
  Database,
  Employee,
  Payment,
  PaymentMethod,
  Plan,
  Student,
  StudentOrigin,
} from '@/types';
import { addDays, addMonths, isSameDay, isSameMonth, toISODate, today } from '@/utils/date';
import { formatMatricula } from '@/utils/format';
import { getDisplayStatus, getPaymentStatus } from '@/services/rules';

export const DB_VERSION = 3;

/** Gerador pseudo-aleatório determinístico (mulberry32). */
function rng(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const seedPlans: Plan[] = [
  {
    id: 'plan_mensal',
    name: 'Mensal',
    price: 99.9,
    durationMonths: 1,
    active: true,
    benefits: ['Musculação livre', 'Área de cardio', 'Avaliação inicial', 'Vestiários completos'],
  },
  {
    id: 'plan_trimestral',
    name: 'Trimestral',
    price: 269.9,
    durationMonths: 3,
    active: true,
    benefits: ['Tudo do Mensal', 'Reavaliação física', 'Treino personalizado', 'Economia de 10%'],
  },
  {
    id: 'plan_semestral',
    name: 'Semestral',
    price: 499.9,
    durationMonths: 6,
    active: true,
    benefits: ['Tudo do Trimestral', '2 reavaliações', 'Acompanhamento mensal', 'Economia de 17%'],
  },
  {
    id: 'plan_anual',
    name: 'Anual',
    price: 899.9,
    durationMonths: 12,
    active: true,
    highlight: true,
    benefits: ['Tudo do Semestral', 'Avaliações trimestrais', 'Camiseta exclusiva', 'Economia de 25%'],
  },
];

type Scenario = 'ok' | 'vencido' | 'bloqueado' | 'inativo' | 'venceHoje' | 'venceLogo';

interface SeedStudent {
  name: string;
  gender: 'men' | 'women';
  portrait: number;
  plan: string;
  origin: StudentOrigin;
  scenario: Scenario;
  matricula: number;
  biometry: boolean;
  method: PaymentMethod;
}

const P = (id: string) => `plan_${id}`;

const seedStudentDefs: SeedStudent[] = [
  { name: 'Lucas Ferreira', gender: 'men', portrait: 32, plan: P('anual'), origin: 'mansao', scenario: 'ok', matricula: 142, biometry: true, method: 'pix' },
  { name: 'Amanda Souza', gender: 'women', portrait: 44, plan: P('mensal'), origin: 'wellhub', scenario: 'ok', matricula: 298, biometry: true, method: 'pix' },
  { name: 'Carlos Henrique', gender: 'men', portrait: 75, plan: P('mensal'), origin: 'mansao', scenario: 'vencido', matricula: 87, biometry: true, method: 'dinheiro' },
  { name: 'Mariana Alves', gender: 'women', portrait: 65, plan: P('mensal'), origin: 'totalpass', scenario: 'ok', matricula: 311, biometry: true, method: 'pix' },
  { name: 'Rafael Martins', gender: 'men', portrait: 12, plan: P('semestral'), origin: 'mansao', scenario: 'ok', matricula: 205, biometry: true, method: 'credito' },
  { name: 'Juliana Costa', gender: 'women', portrait: 68, plan: P('trimestral'), origin: 'mansao', scenario: 'venceHoje', matricula: 176, biometry: true, method: 'debito' },
  { name: 'Bruno Oliveira', gender: 'men', portrait: 51, plan: P('anual'), origin: 'mansao', scenario: 'ok', matricula: 23, biometry: true, method: 'credito' },
  { name: 'Fernanda Lima', gender: 'women', portrait: 21, plan: P('mensal'), origin: 'mansao', scenario: 'vencido', matricula: 389, biometry: false, method: 'pix' },
  { name: 'Diego Rocha', gender: 'men', portrait: 86, plan: P('mensal'), origin: 'mansao', scenario: 'bloqueado', matricula: 64, biometry: true, method: 'dinheiro' },
  { name: 'Patrícia Gomes', gender: 'women', portrait: 33, plan: P('semestral'), origin: 'mansao', scenario: 'ok', matricula: 119, biometry: true, method: 'pix' },
  { name: 'Thiago Barbosa', gender: 'men', portrait: 45, plan: P('mensal'), origin: 'wellhub', scenario: 'ok', matricula: 402, biometry: true, method: 'pix' },
  { name: 'Camila Ribeiro', gender: 'women', portrait: 12, plan: P('mensal'), origin: 'totalpass', scenario: 'ok', matricula: 433, biometry: false, method: 'pix' },
  { name: 'Gustavo Pereira', gender: 'men', portrait: 22, plan: P('trimestral'), origin: 'mansao', scenario: 'venceLogo', matricula: 251, biometry: true, method: 'debito' },
  { name: 'Larissa Mendes', gender: 'women', portrait: 79, plan: P('anual'), origin: 'mansao', scenario: 'ok', matricula: 58, biometry: true, method: 'credito' },
  { name: 'Felipe Araújo', gender: 'men', portrait: 61, plan: P('mensal'), origin: 'mansao', scenario: 'inativo', matricula: 147, biometry: false, method: 'dinheiro' },
  { name: 'Beatriz Cardoso', gender: 'women', portrait: 50, plan: P('trimestral'), origin: 'mansao', scenario: 'ok', matricula: 344, biometry: true, method: 'pix' },
  { name: 'Rodrigo Nunes', gender: 'men', portrait: 8, plan: P('mensal'), origin: 'wellhub', scenario: 'ok', matricula: 468, biometry: false, method: 'pix' },
  { name: 'Vanessa Teixeira', gender: 'women', portrait: 90, plan: P('mensal'), origin: 'mansao', scenario: 'vencido', matricula: 271, biometry: true, method: 'pix' },
  { name: 'André Moreira', gender: 'men', portrait: 36, plan: P('semestral'), origin: 'totalpass', scenario: 'ok', matricula: 455, biometry: true, method: 'pix' },
  { name: 'Letícia Carvalho', gender: 'women', portrait: 27, plan: P('mensal'), origin: 'mansao', scenario: 'venceLogo', matricula: 480, biometry: true, method: 'credito' },
];

const STREETS = ['Rua das Palmeiras', 'Av. Brasil', 'Rua XV de Novembro', 'Rua São João', 'Av. Paulista', 'Rua Ipiranga', 'Rua das Acácias', 'Av. Independência'];
const DISTRICTS = ['Centro', 'Jardim América', 'Vila Nova', 'Boa Vista', 'Santa Cruz', 'Bela Vista'];

function fakeCPF(r: () => number) {
  const d = Array.from({ length: 11 }, () => Math.floor(r() * 10)).join('');
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}
function fakePhone(r: () => number) {
  const d = Array.from({ length: 8 }, () => Math.floor(r() * 10)).join('');
  return `(11) 9${d.slice(0, 4)}-${d.slice(4)}`;
}

function buildStudents(r: () => number) {
  const now = today();
  const plansById = Object.fromEntries(seedPlans.map((p) => [p.id, p]));

  return seedStudentDefs.map<Student>((s, i) => {
    const plan = plansById[s.plan];
    let dueDate: string;
    switch (s.scenario) {
      case 'vencido':
        dueDate = addDays(now, -(4 + Math.floor(r() * 18)));
        break;
      case 'bloqueado':
        dueDate = addDays(now, -(25 + Math.floor(r() * 10)));
        break;
      case 'inativo':
        dueDate = addDays(now, -(80 + Math.floor(r() * 40)));
        break;
      case 'venceHoje':
        dueDate = now;
        break;
      case 'venceLogo':
        dueDate = addDays(now, 2 + Math.floor(r() * 4));
        break;
      default:
        dueDate = addDays(now, 8 + Math.floor(r() * plan.durationMonths * 28));
    }
    // matrícula recente para alguns alunos (novos no mês)
    const enrollmentDate =
      i % 6 === 4 ? addDays(now, -Math.floor(r() * 20)) : addMonths(now, -(2 + Math.floor(r() * 26)));
    const [first, last] = s.name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').split(' ');
    const phone = fakePhone(r);

    return {
      id: `stu_${String(i + 1).padStart(3, '0')}`,
      matricula: formatMatricula(s.matricula),
      name: s.name,
      cpf: fakeCPF(r),
      birthDate: toISODate(new Date(1980 + Math.floor(r() * 25), Math.floor(r() * 12), 1 + Math.floor(r() * 27))),
      phone,
      whatsapp: phone,
      email: `${first}.${last}@email.com`,
      cep: `0${Math.floor(1000 + r() * 8999)}-${Math.floor(100 + r() * 899)}`,
      address: STREETS[Math.floor(r() * STREETS.length)],
      number: String(10 + Math.floor(r() * 1900)),
      district: DISTRICTS[Math.floor(r() * DISTRICTS.length)],
      city: 'São Paulo',
      state: 'SP',
      emergencyContact: `${['Maria', 'José', 'Ana', 'Paulo', 'Cláudia'][Math.floor(r() * 5)]} — ${fakePhone(r)}`,
      planId: s.plan,
      enrollmentDate,
      dueDate,
      paymentMethod: s.method,
      notes: s.scenario === 'bloqueado' ? 'Bloqueado por inadimplência recorrente.' : '',
      photo: `https://randomuser.me/api/portraits/${s.gender}/${s.portrait}.jpg`,
      status: s.scenario === 'bloqueado' ? 'bloqueado' : s.scenario === 'inativo' ? 'inativo' : 'ativo',
      blockReason: s.scenario === 'bloqueado' ? 'Inadimplência recorrente' : undefined,
      origin: s.origin,
      biometry: s.biometry,
      biometryRegisteredAt: s.biometry ? enrollmentDate : undefined,
      createdAt: new Date(enrollmentDate).toISOString(),
    };
  });
}

function buildPayments(students: Student[], r: () => number): Payment[] {
  const payments: Payment[] = [];
  const now = today();
  let n = 1;
  for (const s of students) {
    if (s.origin !== 'mansao') continue;
    const plan = seedPlans.find((p) => p.id === s.planId)!;
    const methodPool: PaymentMethod[] = ['pix', 'pix', 'credito', 'debito', 'dinheiro'];

    // Histórico: dois períodos anteriores pagos
    for (let k = 2; k >= 1; k--) {
      const due = addMonths(s.dueDate, -plan.durationMonths * k);
      const paidDay = addDays(due, -Math.floor(r() * 3));
      payments.push({
        id: `pay_${n++}`,
        studentId: s.id,
        planId: plan.id,
        amount: plan.price,
        dueDate: due,
        paidAt: new Date(`${paidDay}T${10 + Math.floor(r() * 9)}:${10 + Math.floor(r() * 49)}:00`).toISOString(),
        method: k === 1 ? s.paymentMethod : methodPool[Math.floor(r() * methodPool.length)],
      });
    }
    // Parcela atual (em aberto) quando vence em breve ou já venceu
    const daysToDue = (new Date(s.dueDate).getTime() - new Date(now).getTime()) / 86_400_000;
    if (daysToDue <= 10) {
      payments.push({ id: `pay_${n++}`, studentId: s.id, planId: plan.id, amount: plan.price, dueDate: s.dueDate });
    }
  }
  return payments;
}

function buildAccessLogs(students: Student[], r: () => number): AccessLog[] {
  const logs: AccessLog[] = [];
  const nowMs = Date.now();
  let n = 1;
  const eligible = students.filter((s) => getDisplayStatus(s) === 'ativo');
  const originFor = (s: Student): AccessOrigin =>
    s.origin === 'wellhub' ? 'wellhub' : s.origin === 'totalpass' ? 'totalpass' : 'biometria';

  // Os quatro acessos mais recentes (roteiro da apresentação)
  const byName = (name: string) => students.find((s) => s.name === name)!;
  const recent: Array<[string, number, AccessOrigin, 'liberado' | 'bloqueado', string?]> = [
    ['Lucas Ferreira', 3, 'biometria', 'liberado'],
    ['Amanda Souza', 6, 'wellhub', 'liberado'],
    ['Carlos Henrique', 8, 'biometria', 'bloqueado', 'Mensalidade vencida'],
    ['Mariana Alves', 14, 'totalpass', 'liberado'],
  ];
  for (const [name, minutes, origin, result, reason] of recent) {
    const s = byName(name);
    logs.push({
      id: `acc_${n++}`,
      studentId: s.id,
      studentName: s.name,
      timestamp: new Date(nowMs - minutes * 60_000).toISOString(),
      gate: 'Catraca 01',
      origin,
      result,
      reason,
    });
  }

  // Acessos anteriores de hoje
  const startOfDay = new Date();
  startOfDay.setHours(6, 0, 0, 0);
  const span = Math.max(0, nowMs - 15 * 60_000 - startOfDay.getTime());
  const todayCount = Math.min(22, Math.floor(span / (25 * 60_000)));
  for (let i = 0; i < todayCount; i++) {
    const s = eligible[Math.floor(r() * eligible.length)];
    logs.push({
      id: `acc_${n++}`,
      studentId: s.id,
      studentName: s.name,
      timestamp: new Date(startOfDay.getTime() + r() * span).toISOString(),
      gate: 'Catraca 01',
      origin: originFor(s),
      result: 'liberado',
    });
  }
  const diego = byName('Diego Rocha');
  if (span > 0) {
    logs.push({
      id: `acc_${n++}`,
      studentId: diego.id,
      studentName: diego.name,
      timestamp: new Date(startOfDay.getTime() + span * 0.4).toISOString(),
      gate: 'Catraca 01',
      origin: 'biometria',
      result: 'bloqueado',
      reason: 'Aluno bloqueado pela administração',
    });
  }

  // Últimos 30 dias
  for (let d = 1; d <= 30; d++) {
    const count = 4 + Math.floor(r() * 5);
    for (let i = 0; i < count; i++) {
      const s = eligible[Math.floor(r() * eligible.length)];
      const t = new Date();
      t.setDate(t.getDate() - d);
      const hour = r() < 0.45 ? 18 + Math.floor(r() * 3) : 6 + Math.floor(r() * 16);
      t.setHours(hour, Math.floor(r() * 60), 0, 0);
      logs.push({
        id: `acc_${n++}`,
        studentId: s.id,
        studentName: s.name,
        timestamp: t.toISOString(),
        gate: 'Catraca 01',
        origin: originFor(s),
        result: 'liberado',
      });
    }
  }
  return logs.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

const seedEmployees: Employee[] = [
  { id: 'emp_1', name: 'Ricardo Almeida', role: 'Administrador', phone: '(11) 98877-1020', email: 'admin@mansaomaromba.com', active: true, photo: 'https://randomuser.me/api/portraits/men/41.jpg' },
  { id: 'emp_2', name: 'Paula Fontes', role: 'Gerente', phone: '(11) 97765-3344', email: 'paula@mansaomaromba.com', active: true, photo: 'https://randomuser.me/api/portraits/women/31.jpg' },
  { id: 'emp_3', name: 'Jéssica Prado', role: 'Recepcionista', phone: '(11) 96654-7788', email: 'recepcao@mansaomaromba.com', active: true, photo: 'https://randomuser.me/api/portraits/women/57.jpg' },
  { id: 'emp_4', name: 'Marcos Vinícius', role: 'Professor', phone: '(11) 95543-2211', email: 'marcos@mansaomaromba.com', active: true, photo: 'https://randomuser.me/api/portraits/men/52.jpg' },
  { id: 'emp_5', name: 'Tatiane Rezende', role: 'Professor', phone: '(11) 94432-6655', email: 'tatiane@mansaomaromba.com', active: true, photo: 'https://randomuser.me/api/portraits/women/72.jpg' },
  { id: 'emp_6', name: 'Eduardo Sampaio', role: 'Financeiro', phone: '(11) 93321-9900', email: 'financeiro@mansaomaromba.com', active: true, photo: 'https://randomuser.me/api/portraits/men/67.jpg' },
  { id: 'emp_7', name: 'Renan Duarte', role: 'Recepcionista', phone: '(11) 92210-4433', email: 'renan@mansaomaromba.com', active: false, photo: 'https://randomuser.me/api/portraits/men/15.jpg' },
];

function buildNotifications(): AppNotification[] {
  const ago = (min: number) => new Date(Date.now() - min * 60_000).toISOString();
  return [
    { id: 'ntf_1', title: 'Mensalidades', message: '5 mensalidades vencem hoje.', kind: 'warning', createdAt: ago(2), read: false },
    { id: 'ntf_2', title: 'Catraca 01', message: 'Acesso bloqueado na Catraca 01.', kind: 'danger', createdAt: ago(8), read: false },
    { id: 'ntf_3', title: 'Wellhub', message: 'Check-in Wellhub realizado.', kind: 'info', createdAt: ago(6), read: false },
    { id: 'ntf_4', title: 'Cadastro', message: 'Novo aluno cadastrado.', kind: 'success', createdAt: ago(55), read: true },
    { id: 'ntf_5', title: 'Financeiro', message: 'Pagamento registrado.', kind: 'success', createdAt: ago(130), read: true },
  ];
}

export function createSeedDatabase(): Database {
  const r = rng(20251);
  const students = buildStudents(r);
  const payments = buildPayments(students, r);
  const accessLogs = buildAccessLogs(students, r);

  // Calcula a "base" para que os indicadores batam com os números da apresentação.
  const activeCount = students.filter((s) => getDisplayStatus(s) === 'ativo').length;
  const todayAllowed = accessLogs.filter((l) => isSameDay(l.timestamp) && l.result === 'liberado');
  const openPayments = payments.filter((p) => getPaymentStatus(p) !== 'pago');
  const paidMonth = payments.filter((p) => p.paidAt && isSameMonth(p.paidAt));
  const paidToday = payments.filter((p) => p.paidAt && isSameDay(p.paidAt));
  const sum = (ps: Payment[]) => ps.reduce((acc, p) => acc + p.amount, 0);
  const clamp = (v: number) => Math.max(0, Math.round(v * 100) / 100);

  return {
    version: DB_VERSION,
    students,
    plans: seedPlans,
    payments,
    accessLogs,
    employees: seedEmployees,
    notifications: buildNotifications(),
    baseline: {
      activeStudents: clamp(487 - activeCount),
      checkinsToday: clamp(163 - todayAllowed.length),
      pendingPayments: clamp(27 - openPayments.length),
      revenueMonth: clamp(47850 - sum(paidMonth)),
      revenueToday: clamp(1890.6 - sum(paidToday)),
      receivable: clamp(8640 - sum(openPayments)),
      newStudents: clamp(32 - students.filter((s) => isSameMonth(s.enrollmentDate)).length),
      blockedAccesses: clamp(8 - accessLogs.filter((l) => isSameDay(l.timestamp) && l.result === 'bloqueado').length),
      checkinsWellhub: clamp(38 - todayAllowed.filter((l) => l.origin === 'wellhub').length),
      checkinsTotalpass: clamp(24 - todayAllowed.filter((l) => l.origin === 'totalpass').length),
    },
    settings: {
      gymName: 'Mansão Maromba',
      cnpj: '12.345.678/0001-90',
      phone: '(11) 4002-8922',
      email: 'contato@mansaomaromba.com',
      address: 'Av. dos Campeões, 1500 — São Paulo/SP',
      graceDays: 0,
      autoBlockOverdue: true,
      soundOnAccess: true,
    },
    nextMatricula: 488,
  };
}
