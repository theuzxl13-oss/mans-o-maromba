import { useEffect, useState, type ReactNode } from 'react';
import { Button, Field, Modal, Textarea } from '@/components/ui';

/** Modal genérico que solicita um motivo (liberação manual, bloqueio, etc.). */
export function ReasonModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  icon,
  confirmLabel,
  suggestions = [],
  variant = 'primary',
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  title: string;
  description?: string;
  icon?: ReactNode;
  confirmLabel: string;
  suggestions?: string[];
  variant?: 'primary' | 'success';
}) {
  const [reason, setReason] = useState('');
  useEffect(() => {
    if (open) setReason('');
  }, [open]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      icon={icon}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant={variant}
            disabled={reason.trim().length < 3}
            onClick={() => {
              onConfirm(reason.trim());
              onClose();
            }}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <Field label="Motivo" hint="Obrigatório — ficará registrado no histórico.">
        <Textarea autoFocus value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Descreva o motivo..." />
      </Field>
      {suggestions.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setReason(s)}
              className="cursor-pointer rounded-md border border-white/10 px-2 py-1 text-xs text-zinc-400 transition hover:border-white/25 hover:text-white"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </Modal>
  );
}
