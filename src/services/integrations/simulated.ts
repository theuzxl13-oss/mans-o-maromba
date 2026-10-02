// ============================================================
//  SIMULAÇÃO PARA DEMONSTRAÇÃO
//  Nenhuma chamada real é feita para hardware, Wellhub, TotalPass
//  ou gateways de pagamento. Os atrasos simulam o tempo de resposta.
//  NÃO há endpoints reais (nem inventados) destes serviços aqui.
// ============================================================

import type { Student } from '@/types';
import { normalize, sleep, uid } from '@/utils/misc';
import { onlyDigits } from '@/utils/format';
import type {
  BiometricReader,
  GateInfo,
  PartnerCheckinProvider,
  PaymentGateway,
  TurnstileDriver,
} from './types';

export class SimulatedBiometricReader implements BiometricReader {
  readonly deviceName = 'Leitor Biométrico (simulado)';

  async enroll(studentId: string) {
    await sleep(2200);
    return { templateId: `fp_${studentId}_${Date.now().toString(36)}`, quality: 88 + Math.floor(Math.random() * 11) };
  }

  async identify(candidateStudentId: string) {
    await sleep(1400);
    return { studentId: candidateStudentId, score: 0.93 + Math.random() * 0.06 };
  }
}

export class SimulatedTurnstile implements TurnstileDriver {
  private gates: GateInfo[] = [
    { id: 'catraca-01', name: 'Catraca 01', direction: 'entrada', online: true },
    { id: 'catraca-02', name: 'Catraca 02', direction: 'saida', online: true },
  ];

  async listGates() {
    await sleep(200);
    return this.gates;
  }

  async release(_gateId: string) {
    await sleep(300);
  }
}

/** Localiza aluno por CPF ou matrícula (ou nome, para facilitar a demonstração). */
function findStudent(query: string, students: Student[]) {
  const q = query.trim();
  const digits = onlyDigits(q);
  return students.find(
    (s) =>
      (digits.length >= 11 && onlyDigits(s.cpf) === digits) ||
      s.matricula.toLowerCase() === q.toLowerCase() ||
      (digits.length > 0 && digits.length < 11 && onlyDigits(s.matricula) === digits.padStart(6, '0')) ||
      (q.length >= 3 && normalize(s.name).includes(normalize(q))),
  );
}

export class SimulatedPartnerProvider implements PartnerCheckinProvider {
  constructor(readonly provider: 'wellhub' | 'totalpass') {}

  async verifyCheckin(query: string, students: Student[]) {
    await sleep(1600);
    const student = findStudent(query, students);
    if (!student) throw new Error('Nenhum aluno encontrado para o CPF ou matrícula informados.');
    if (student.origin !== this.provider) {
      const label = this.provider === 'wellhub' ? 'Wellhub' : 'TotalPass';
      throw new Error(`${student.name} não possui check-in ${label} ativo hoje.`);
    }
    const minutesAgo = 1 + Math.floor(Math.random() * 6);
    return {
      provider: this.provider,
      student,
      checkinAt: new Date(Date.now() - minutesAgo * 60_000).toISOString(),
      validated: true,
      token: uid(this.provider).toUpperCase(),
    };
  }
}

export class SimulatedPaymentGateway implements PaymentGateway {
  async createPixCharge(amount: number, description: string) {
    await sleep(500);
    const txid = uid('pix').toUpperCase();
    return {
      txid,
      amount,
      copyPaste: `00020126DEMO-${txid}-${description.replace(/\s+/g, '').slice(0, 20)}5204000053039865406${amount.toFixed(2)}`,
    };
  }

  async confirm(_txid: string) {
    await sleep(800);
    return { confirmed: true };
  }
}
