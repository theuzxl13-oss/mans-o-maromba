import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type {
  AccessLog,
  AppNotification,
  Database,
  Employee,
  NotificationKind,
  PaymentMethod,
  Plan,
  Student,
  StudentInput,
} from '@/types';
import { repository, STORAGE_KEY } from '@/services/repository';
import { addMonths, today } from '@/utils/date';
import { formatMatricula } from '@/utils/format';
import { uid } from '@/utils/misc';

interface PaymentInput {
  studentId: string;
  amount: number;
  date: string; // yyyy-mm-dd
  method: PaymentMethod;
  paymentId?: string;
}

interface DataContextValue {
  db: Database;
  getStudent: (id: string) => Student | undefined;
  getPlan: (id: string | null) => Plan | undefined;
  addStudent: (input: StudentInput) => Student;
  updateStudent: (id: string, patch: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  registerBiometry: (id: string) => void;
  setBlocked: (id: string, blocked: boolean, reason?: string) => void;
  renewPlan: (id: string, planId: string) => void;
  registerPayment: (input: PaymentInput) => void;
  registerAccess: (log: Omit<AccessLog, 'id' | 'timestamp' | 'gate'> & { gate?: string }) => AccessLog;
  savePlan: (plan: Omit<Plan, 'id'> & { id?: string }) => void;
  togglePlan: (id: string) => void;
  deletePlan: (id: string) => void;
  saveEmployee: (e: Omit<Employee, 'id'> & { id?: string }) => void;
  deleteEmployee: (id: string) => void;
  notify: (title: string, message: string, kind?: NotificationKind) => void;
  markNotificationsRead: () => void;
  clearNotifications: () => void;
  updateSettings: (patch: Partial<Database['settings']>) => void;
  resetDemo: () => void;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<Database>(() => repository.load());
  const skipSave = useRef(true);

  useEffect(() => {
    if (skipSave.current) {
      skipSave.current = false;
      return;
    }
    repository.save(db);
  }, [db]);

  // Sincroniza entre abas (ex.: Controle de Acesso aberto em outra janela).
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY || !e.newValue) return;
      try {
        skipSave.current = true;
        setDb(JSON.parse(e.newValue) as Database);
      } catch {
        /* ignora */
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const pushNotification = (d: Database, title: string, message: string, kind: NotificationKind = 'info'): Database => {
    const n: AppNotification = { id: uid('ntf'), title, message, kind, createdAt: new Date().toISOString(), read: false };
    return { ...d, notifications: [n, ...d.notifications].slice(0, 40) };
  };

  const notify = useCallback((title: string, message: string, kind: NotificationKind = 'info') => {
    setDb((d) => pushNotification(d, title, message, kind));
  }, []);

  const getStudent = useCallback((id: string) => db.students.find((s) => s.id === id), [db.students]);
  const getPlan = useCallback((id: string | null) => db.plans.find((p) => p.id === id), [db.plans]);

  const addStudent = useCallback(
    (input: StudentInput) => {
      // Calculado a partir do estado atual para gerar a matrícula de forma síncrona.
      const student: Student = {
        ...input,
        id: uid('stu'),
        matricula: formatMatricula(db.nextMatricula),
        status: input.status ?? 'ativo',
        biometry: false,
        createdAt: new Date().toISOString(),
      };
      setDb((d) => {
        const plan = d.plans.find((p) => p.id === input.planId);
        const payments =
          plan && input.origin === 'mansao'
            ? [
                {
                  id: uid('pay'),
                  studentId: student.id,
                  planId: plan.id,
                  amount: plan.price,
                  dueDate: input.enrollmentDate,
                  paidAt: new Date().toISOString(),
                  method: input.paymentMethod,
                },
                ...d.payments,
              ]
            : d.payments;
        const next = {
          ...d,
          students: [student, ...d.students],
          payments,
          nextMatricula: Math.max(d.nextMatricula, db.nextMatricula) + 1,
        };
        return pushNotification(next, 'Cadastro', `Novo aluno cadastrado: ${student.name} (${student.matricula}).`, 'success');
      });
      return student;
    },
    [db.nextMatricula],
  );

  const updateStudent = useCallback((id: string, patch: Partial<Student>) => {
    setDb((d) => ({ ...d, students: d.students.map((s) => (s.id === id ? { ...s, ...patch } : s)) }));
  }, []);

  const deleteStudent = useCallback((id: string) => {
    setDb((d) => ({
      ...d,
      students: d.students.filter((s) => s.id !== id),
      payments: d.payments.filter((p) => p.studentId !== id),
    }));
  }, []);

  const registerBiometry = useCallback((id: string) => {
    setDb((d) => {
      const s = d.students.find((x) => x.id === id);
      const next = {
        ...d,
        students: d.students.map((x) =>
          x.id === id ? { ...x, biometry: true, biometryRegisteredAt: today() } : x,
        ),
      };
      return s ? pushNotification(next, 'Biometria', `Digital cadastrada para ${s.name}.`, 'success') : next;
    });
  }, []);

  const setBlocked = useCallback((id: string, blocked: boolean, reason?: string) => {
    setDb((d) => {
      const s = d.students.find((x) => x.id === id);
      const next = {
        ...d,
        students: d.students.map((x) =>
          x.id === id ? { ...x, status: blocked ? ('bloqueado' as const) : ('ativo' as const), blockReason: blocked ? reason : undefined } : x,
        ),
      };
      return s
        ? pushNotification(next, 'Alunos', `${s.name} foi ${blocked ? 'bloqueado' : 'desbloqueado'}.`, blocked ? 'danger' : 'success')
        : next;
    });
  }, []);

  const renewPlan = useCallback((id: string, planId: string) => {
    setDb((d) => {
      const s = d.students.find((x) => x.id === id);
      const plan = d.plans.find((p) => p.id === planId);
      if (!s || !plan) return d;
      const base = s.dueDate >= today() ? s.dueDate : today();
      const newDue = addMonths(base, plan.durationMonths);
      const next: Database = {
        ...d,
        students: d.students.map((x) =>
          x.id === id ? { ...x, planId, dueDate: newDue, status: x.status === 'inativo' ? 'ativo' : x.status } : x,
        ),
        payments: [
          { id: uid('pay'), studentId: id, planId, amount: plan.price, dueDate: base },
          ...d.payments.filter((p) => !(p.studentId === id && !p.paidAt)),
        ],
      };
      return pushNotification(next, 'Renovação', `Plano ${plan.name} renovado para ${s.name}.`, 'success');
    });
  }, []);

  const registerPayment = useCallback((input: PaymentInput) => {
    setDb((d) => {
      const s = d.students.find((x) => x.id === input.studentId);
      if (!s) return d;
      const plan = d.plans.find((p) => p.id === s.planId);
      const paidAt = new Date(`${input.date}T${new Date().toTimeString().slice(0, 8)}`).toISOString();
      const open = d.payments
        .filter((p) => p.studentId === s.id && !p.paidAt)
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
      const target = input.paymentId ? d.payments.find((p) => p.id === input.paymentId) : open[0];

      let payments = d.payments;
      if (target) {
        payments = d.payments.map((p) =>
          p.id === target.id ? { ...p, paidAt, method: input.method, amount: input.amount } : p,
        );
      } else {
        payments = [
          { id: uid('pay'), studentId: s.id, planId: s.planId, amount: input.amount, dueDate: input.date, paidAt, method: input.method },
          ...d.payments,
        ];
      }

      // Estende o vencimento a partir do vencimento atual (ou de hoje, se já venceu).
      const months = plan?.durationMonths ?? 1;
      const base = s.dueDate >= today() ? s.dueDate : today();
      const coversCurrent = !target || target.dueDate <= s.dueDate;
      const newDue = coversCurrent ? addMonths(base, months) : s.dueDate;

      const next: Database = {
        ...d,
        payments,
        students: d.students.map((x) =>
          x.id === s.id
            ? {
                ...x,
                dueDate: newDue,
                paymentMethod: input.method,
                // pagamento regulariza alunos bloqueados por inadimplência / inativos
                status: 'ativo',
                blockReason: undefined,
              }
            : x,
        ),
      };
      return pushNotification(next, 'Financeiro', `Pagamento registrado: ${s.name}.`, 'success');
    });
  }, []);

  const registerAccess = useCallback<DataContextValue['registerAccess']>((log) => {
    const entry: AccessLog = { gate: 'Catraca 01', ...log, id: uid('acc'), timestamp: new Date().toISOString() };
    setDb((d) => {
      let next: Database = {
        ...d,
        accessLogs: [entry, ...d.accessLogs],
        students:
          entry.result === 'liberado' && entry.studentId
            ? d.students.map((s) => (s.id === entry.studentId ? { ...s, lastAccess: entry.timestamp } : s))
            : d.students,
      };
      if (entry.result === 'bloqueado') {
        next = pushNotification(next, entry.gate, `Acesso bloqueado na ${entry.gate}: ${entry.studentName}.`, 'danger');
      } else if (entry.origin === 'wellhub' || entry.origin === 'totalpass') {
        const label = entry.origin === 'wellhub' ? 'Wellhub' : 'TotalPass';
        next = pushNotification(next, label, `Check-in ${label} realizado: ${entry.studentName}.`, 'info');
      } else if (entry.origin === 'manual') {
        next = pushNotification(next, entry.gate, `Acesso liberado pelo administrador: ${entry.studentName}.`, 'warning');
      }
      return next;
    });
    return entry;
  }, []);

  const savePlan = useCallback((plan: Omit<Plan, 'id'> & { id?: string }) => {
    setDb((d) => {
      if (plan.id) return { ...d, plans: d.plans.map((p) => (p.id === plan.id ? { ...p, ...plan, id: p.id } : p)) };
      return { ...d, plans: [...d.plans, { ...plan, id: uid('plan') }] };
    });
  }, []);

  const togglePlan = useCallback((id: string) => {
    setDb((d) => ({ ...d, plans: d.plans.map((p) => (p.id === id ? { ...p, active: !p.active } : p)) }));
  }, []);

  const deletePlan = useCallback((id: string) => {
    setDb((d) => ({ ...d, plans: d.plans.filter((p) => p.id !== id) }));
  }, []);

  const saveEmployee = useCallback((e: Omit<Employee, 'id'> & { id?: string }) => {
    setDb((d) => {
      if (e.id) return { ...d, employees: d.employees.map((x) => (x.id === e.id ? { ...x, ...e, id: x.id } : x)) };
      return { ...d, employees: [...d.employees, { ...e, id: uid('emp') }] };
    });
  }, []);

  const deleteEmployee = useCallback((id: string) => {
    setDb((d) => ({ ...d, employees: d.employees.filter((x) => x.id !== id) }));
  }, []);

  const markNotificationsRead = useCallback(() => {
    setDb((d) => ({ ...d, notifications: d.notifications.map((n) => ({ ...n, read: true })) }));
  }, []);

  const clearNotifications = useCallback(() => setDb((d) => ({ ...d, notifications: [] })), []);

  const updateSettings = useCallback((patch: Partial<Database['settings']>) => {
    setDb((d) => ({ ...d, settings: { ...d.settings, ...patch } }));
  }, []);

  const resetDemo = useCallback(() => setDb(repository.reset()), []);

  const value = useMemo<DataContextValue>(
    () => ({
      db,
      getStudent,
      getPlan,
      addStudent,
      updateStudent,
      deleteStudent,
      registerBiometry,
      setBlocked,
      renewPlan,
      registerPayment,
      registerAccess,
      savePlan,
      togglePlan,
      deletePlan,
      saveEmployee,
      deleteEmployee,
      notify,
      markNotificationsRead,
      clearNotifications,
      updateSettings,
      resetDemo,
    }),
    [db, getStudent, getPlan, addStudent, updateStudent, deleteStudent, registerBiometry, setBlocked, renewPlan, registerPayment, registerAccess, savePlan, togglePlan, deletePlan, saveEmployee, deleteEmployee, notify, markNotificationsRead, clearNotifications, updateSettings, resetDemo],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData deve ser usado dentro de <DataProvider>');
  return ctx;
}
