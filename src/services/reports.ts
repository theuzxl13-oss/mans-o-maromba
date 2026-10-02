// Geração de relatórios a partir dos dados locais + exportação em PDF (jsPDF).
// Em produção, relatórios pesados podem ser gerados no backend (SQL/Views no PostgreSQL).

import { jsPDF } from 'jspdf';
import type { Database } from '@/types';
import { getDisplayStatus, getPaymentStatus } from './rules';
import { formatDate, formatDateTime, formatTime } from '@/utils/date';
import { accessOriginLabel, formatCurrency, paymentMethodLabel, studentOriginLabel } from '@/utils/format';

export type ReportType =
  | 'alunos'
  | 'ativos'
  | 'inadimplentes'
  | 'checkins'
  | 'acessos'
  | 'wellhub'
  | 'totalpass'
  | 'financeiro'
  | 'mensalidades'
  | 'receita';

export interface ReportFilters {
  from: string;
  to: string;
  status: string; // 'todos' | ...
  planId: string; // 'todos' | id
}

export interface ReportResult {
  title: string;
  columns: string[];
  rows: string[][];
  summary: { label: string; value: string }[];
}

const STATUS_LABEL: Record<string, string> = { ativo: 'Ativo', vencido: 'Vencido', inativo: 'Inativo', bloqueado: 'Bloqueado' };

export const REPORT_TITLES: Record<ReportType, string> = {
  alunos: 'Relatório de alunos',
  ativos: 'Alunos ativos',
  inadimplentes: 'Alunos inadimplentes',
  checkins: 'Check-ins',
  acessos: 'Acessos',
  wellhub: 'Wellhub',
  totalpass: 'TotalPass',
  financeiro: 'Financeiro',
  mensalidades: 'Mensalidades',
  receita: 'Receita',
};

export function generateReport(db: Database, type: ReportType, f: ReportFilters): ReportResult {
  const inRange = (iso: string) => {
    const d = iso.slice(0, 10);
    return (!f.from || d >= f.from) && (!f.to || d <= f.to);
  };
  const plan = (id: string | null) => db.plans.find((p) => p.id === id)?.name ?? '—';
  const byPlan = <T extends { planId: string | null }>(x: T) => f.planId === 'todos' || x.planId === f.planId;
  const title = REPORT_TITLES[type];

  switch (type) {
    case 'alunos':
    case 'ativos':
    case 'inadimplentes': {
      const list = db.students
        .filter(byPlan)
        .filter((s) => {
          const st = getDisplayStatus(s);
          if (type === 'ativos') return st === 'ativo';
          if (type === 'inadimplentes') return st === 'vencido' || (st === 'bloqueado' && s.origin === 'mansao');
          return f.status === 'todos' || st === f.status;
        })
        .sort((a, b) => a.name.localeCompare(b.name));
      return {
        title,
        columns: ['Matrícula', 'Nome', 'Telefone', 'Plano', 'Vencimento', 'Origem', 'Status'],
        rows: list.map((s) => [
          s.matricula,
          s.name,
          s.phone,
          s.origin === 'mansao' ? plan(s.planId) : '—',
          s.origin === 'mansao' ? formatDate(s.dueDate) : '—',
          studentOriginLabel[s.origin],
          STATUS_LABEL[getDisplayStatus(s)],
        ]),
        summary: [
          { label: 'Total de alunos', value: String(list.length) },
          { label: 'Com biometria', value: String(list.filter((s) => s.biometry).length) },
        ],
      };
    }
    case 'checkins':
    case 'acessos':
    case 'wellhub':
    case 'totalpass': {
      const list = db.accessLogs.filter((l) => {
        if (!inRange(l.timestamp)) return false;
        if (type === 'checkins') return l.result === 'liberado';
        if (type === 'wellhub' || type === 'totalpass') return l.origin === type;
        return f.status === 'todos' || l.result === f.status;
      });
      return {
        title,
        columns: ['Aluno', 'Data', 'Horário', 'Catraca', 'Origem', 'Status'],
        rows: list.map((l) => [
          l.studentName,
          formatDate(l.timestamp),
          formatTime(l.timestamp),
          l.gate,
          accessOriginLabel[l.origin],
          l.result === 'liberado' ? 'Liberado' : `Bloqueado${l.reason ? ` (${l.reason})` : ''}`,
        ]),
        summary: [
          { label: 'Registros', value: String(list.length) },
          { label: 'Liberados', value: String(list.filter((l) => l.result === 'liberado').length) },
          { label: 'Bloqueados', value: String(list.filter((l) => l.result === 'bloqueado').length) },
        ],
      };
    }
    case 'financeiro':
    case 'mensalidades':
    case 'receita': {
      const list = db.payments
        .filter(byPlan)
        .filter((p) => {
          const st = getPaymentStatus(p);
          if (type === 'receita') return !!p.paidAt && inRange(p.paidAt);
          if (!inRange(p.paidAt ?? p.dueDate)) return false;
          return f.status === 'todos' || st === f.status;
        })
        .sort((a, b) => (b.paidAt ?? b.dueDate).localeCompare(a.paidAt ?? a.dueDate));
      const name = (id: string) => db.students.find((s) => s.id === id)?.name ?? '—';
      const paid = list.filter((p) => p.paidAt).reduce((a, p) => a + p.amount, 0);
      const open = list.filter((p) => !p.paidAt).reduce((a, p) => a + p.amount, 0);
      return {
        title,
        columns: ['Aluno', 'Plano', 'Valor', 'Vencimento', 'Pagamento', 'Forma', 'Status'],
        rows: list.map((p) => [
          name(p.studentId),
          plan(p.planId),
          formatCurrency(p.amount),
          formatDate(p.dueDate),
          p.paidAt ? formatDateTime(p.paidAt) : '—',
          p.method ? paymentMethodLabel[p.method] : '—',
          { pago: 'Pago', pendente: 'Pendente', vencido: 'Vencido' }[getPaymentStatus(p)],
        ]),
        summary: [
          { label: 'Lançamentos', value: String(list.length) },
          { label: 'Recebido', value: formatCurrency(paid) },
          { label: 'Em aberto', value: formatCurrency(open) },
        ],
      };
    }
  }
}

/** Gera um PDF demonstrativo com cabeçalho da marca e tabela paginada. */
export function exportReportPDF(report: ReportResult, f: ReportFilters, gymName: string) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 12;

  const header = () => {
    doc.setFillColor(11, 11, 13);
    doc.rect(0, 0, W, 26, 'F');
    doc.setFillColor(225, 29, 46);
    doc.rect(0, 26, W, 1.2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text(gymName.toUpperCase(), M, 12);
    doc.setFontSize(10);
    doc.setTextColor(225, 29, 46);
    doc.text(report.title.toUpperCase(), M, 19);
    doc.setTextColor(170, 170, 170);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const period = `Período: ${f.from ? formatDate(f.from) : 'início'} a ${f.to ? formatDate(f.to) : 'hoje'}`;
    doc.text(`${period}   ·   Gerado em ${new Date().toLocaleString('pt-BR')}`, W - M, 19, { align: 'right' });
  };

  header();
  let y = 36;
  // Resumo
  doc.setFontSize(9);
  report.summary.forEach((s, i) => {
    const x = M + i * 62;
    doc.setDrawColor(220, 220, 220);
    doc.roundedRect(x, y - 5, 58, 14, 2, 2);
    doc.setTextColor(120, 120, 120);
    doc.text(s.label.toUpperCase(), x + 3, y);
    doc.setTextColor(20, 20, 20);
    doc.setFont('helvetica', 'bold');
    doc.text(s.value, x + 3, y + 6);
    doc.setFont('helvetica', 'normal');
  });
  y += 18;

  const colW = (W - M * 2) / report.columns.length;
  const drawHead = () => {
    doc.setFillColor(36, 36, 42);
    doc.rect(M, y - 5, W - M * 2, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    report.columns.forEach((c, i) => doc.text(c.toUpperCase(), M + 2 + i * colW, y));
    doc.setFont('helvetica', 'normal');
    y += 7;
  };
  drawHead();

  doc.setFontSize(8);
  report.rows.forEach((row, r) => {
    if (y > H - 16) {
      doc.addPage();
      header();
      y = 36;
      drawHead();
    }
    if (r % 2 === 0) {
      doc.setFillColor(245, 245, 246);
      doc.rect(M, y - 4.5, W - M * 2, 7, 'F');
    }
    doc.setTextColor(30, 30, 30);
    row.forEach((cell, i) => {
      const text = doc.splitTextToSize(cell, colW - 3)[0] as string;
      doc.text(text, M + 2 + i * colW, y);
    });
    y += 7;
  });

  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text('Documento demonstrativo — dados fictícios', M, H - 6);
    doc.text(`Página ${i} de ${pages}`, W - M, H - 6, { align: 'right' });
  }

  doc.save(`${report.title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}.pdf`);
}
