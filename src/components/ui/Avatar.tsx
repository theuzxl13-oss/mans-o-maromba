import { useState } from 'react';
import { cn } from '@/utils/misc';
import { initials } from '@/utils/format';

const sizes = { xs: 'size-7 text-[10px]', sm: 'size-9 text-xs', md: 'size-11 text-sm', lg: 'size-16 text-lg', xl: 'size-24 text-2xl' };

export function Avatar({
  name,
  src,
  size = 'sm',
  ring,
  className,
}: {
  name: string;
  src?: string;
  size?: keyof typeof sizes;
  ring?: boolean;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  return (
    <span
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-ink-600 to-ink-750 font-semibold text-zinc-200',
        ring && 'ring-2 ring-brand-500/60 ring-offset-2 ring-offset-ink-850',
        sizes[size],
        className,
      )}
    >
      {src && !failed ? (
        <img src={src} alt={name} className="size-full object-cover" onError={() => setFailed(true)} loading="lazy" />
      ) : (
        initials(name)
      )}
    </span>
  );
}
