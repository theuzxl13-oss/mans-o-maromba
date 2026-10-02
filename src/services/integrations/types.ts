// Contratos das integrações externas.
// Cada integração possui uma implementação SIMULADA nesta versão.
// Para integrar com o hardware/serviço real, crie uma nova classe que
// implemente a mesma interface e troque a instância em `./index.ts`.

import type { Student } from '@/types';

/* ---------- Leitor biométrico ---------- */
export interface FingerprintCapture {
  templateId: string;
  quality: number; // 0-100
}
export interface BiometricReader {
  readonly deviceName: string;
  /** Captura e cadastra a digital de um aluno. */
  enroll(studentId: string): Promise<FingerprintCapture>;
  /** Lê a digital no leitor e retorna o id do aluno identificado. */
  identify(candidateStudentId: string): Promise<{ studentId: string; score: number }>;
}

/* ---------- Catraca ---------- */
export type GateDirection = 'entrada' | 'saida';
export interface GateInfo {
  id: string;
  name: string;
  direction: GateDirection;
  online: boolean;
}
export interface TurnstileDriver {
  listGates(): Promise<GateInfo[]>;
  /** Envia o comando de liberação (giro) da catraca. */
  release(gateId: string): Promise<void>;
}

/* ---------- Parceiros (Wellhub / TotalPass) ---------- */
export interface PartnerCheckin {
  provider: 'wellhub' | 'totalpass';
  student: Student;
  checkinAt: string; // ISO
  validated: boolean;
  token: string;
}
export interface PartnerCheckinProvider {
  readonly provider: 'wellhub' | 'totalpass';
  /** Busca um check-in feito pelo aluno no app do parceiro (por CPF ou matrícula). */
  verifyCheckin(query: string, students: Student[]): Promise<PartnerCheckin>;
}

/* ---------- Pagamentos ---------- */
export interface PixCharge {
  txid: string;
  copyPaste: string;
  amount: number;
}
export interface PaymentGateway {
  createPixCharge(amount: number, description: string): Promise<PixCharge>;
  confirm(txid: string): Promise<{ confirmed: boolean }>;
}
