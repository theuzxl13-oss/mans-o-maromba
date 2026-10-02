import { useEffect, useState } from 'react';
import { CheckCircle2, Fingerprint } from 'lucide-react';
import { Avatar, Button, Modal } from '@/components/ui';
import { FingerprintScanner, type ScanState } from './Fingerprint';
import { biometricReader } from '@/services/integrations';
import { useData } from '@/hooks/useData';
import { useToast } from '@/hooks/useToast';
import type { Student } from '@/types';

/** Modal de cadastro de digital — SIMULAÇÃO (sem leitor físico). */
export function EnrollBiometryModal({ student, open, onClose }: { student: Student | null; open: boolean; onClose: () => void }) {
  const { registerBiometry } = useData();
  const toast = useToast();
  const [state, setState] = useState<ScanState>('idle');
  const [quality, setQuality] = useState(0);

  useEffect(() => {
    if (open) setState('idle');
  }, [open]);

  const start = async () => {
    if (!student) return;
    setState('scanning');
    const result = await biometricReader.enroll(student.id);
    setQuality(result.quality);
    registerBiometry(student.id);
    setState('success');
    toast.success('Digital cadastrada com sucesso', `${student.name} já pode acessar pela biometria.`);
  };

  if (!student) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      locked={state === 'scanning'}
      title="Cadastrar digital"
      description={biometricReader.deviceName}
      icon={<Fingerprint className="size-5" />}
      footer={
        state === 'success' ? (
          <Button onClick={onClose}>Concluir</Button>
        ) : (
          <>
            <Button variant="ghost" onClick={onClose} disabled={state === 'scanning'}>
              Cancelar
            </Button>
            <Button onClick={start} loading={state === 'scanning'} icon={<Fingerprint className="size-4" />}>
              {state === 'scanning' ? 'Capturando...' : 'Iniciar captura'}
            </Button>
          </>
        )
      }
    >
      <div className="mb-6 flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3">
        <Avatar name={student.name} src={student.photo} size="md" />
        <div>
          <p className="font-semibold text-white">{student.name}</p>
          <p className="text-xs text-zinc-500">Matrícula {student.matricula}</p>
        </div>
      </div>
      <FingerprintScanner state={state} size="lg" />
      <div className="mt-6 text-center" aria-live="polite">
        {state === 'idle' && <p className="text-sm text-zinc-300">Posicione o dedo no leitor biométrico.</p>}
        {state === 'scanning' && (
          <p className="font-display animate-pulse text-lg tracking-widest text-brand-400 uppercase">Capturando digital...</p>
        )}
        {state === 'success' && (
          <div className="animate-scale-in">
            <p className="font-display flex items-center justify-center gap-2 text-lg tracking-wider text-emerald-400 uppercase">
              <CheckCircle2 className="size-5" /> Digital cadastrada com sucesso
            </p>
            <p className="mt-1 text-xs text-zinc-500">Qualidade da leitura: {quality}%</p>
          </div>
        )}
      </div>
    </Modal>
  );
}
