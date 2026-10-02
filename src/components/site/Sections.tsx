import type { ReactNode } from 'react';
import {
  ArrowRight,
  Car,
  Check,
  ChevronDown,
  Clock,
  Dumbbell,
  HeartPulse,
  Mail,
  MapPin,
  Phone,
  ShowerHead,
  Snowflake,
  Star,
  Trophy,
  Users,
  Wrench,
} from 'lucide-react';
import { Button, LOGO_URL } from '@/components/ui';
import { ABOUT_IMAGE, HERO_IMAGE, STRUCTURE_IMAGES } from '@/assets/images';
import type { Plan } from '@/types';
import { formatCurrency } from '@/utils/format';
import { cn } from '@/utils/misc';
import { scrollToId } from './Navbar';

function SectionTitle({ eyebrow, title, subtitle, center }: { eyebrow: string; title: ReactNode; subtitle?: string; center?: boolean }) {
  return (
    <div className={cn('max-w-2xl', center && 'mx-auto text-center')}>
      <p className="mb-3 inline-flex items-center gap-2 text-xs font-bold tracking-[0.3em] text-brand-500 uppercase">
        <span className="h-px w-8 bg-brand-500" /> {eyebrow}
      </p>
      <h2 className="font-display text-4xl leading-[1.05] font-bold tracking-wide text-white uppercase sm:text-5xl">{title}</h2>
      {subtitle && <p className="mt-4 text-zinc-400">{subtitle}</p>}
    </div>
  );
}

/** Imagem com fallback silencioso. */
function Img({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return <img src={src} alt={alt} loading="lazy" className={className} onError={(e) => (e.currentTarget.style.visibility = 'hidden')} />;
}

export function Hero() {
  return (
    <section id="inicio" className="relative flex min-h-[100svh] items-center overflow-hidden bg-ink-950">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,#3b0a10,transparent_60%)]" />
      <Img src={HERO_IMAGE} alt="Interior da academia" className="absolute inset-0 size-full scale-105 object-cover opacity-45 grayscale-[35%]" />
      <div className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/75 to-ink-950/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-transparent to-ink-950/40" />
      <div className="absolute top-0 right-[18%] hidden h-full w-px bg-gradient-to-b from-transparent via-brand-500/40 to-transparent lg:block" />

      <div className="relative mx-auto w-full max-w-7xl px-4 pt-28 pb-20 sm:px-6">
        <img
          src={LOGO_URL}
          alt="Logo Mansão Maromba"
          onError={(e) => (e.currentTarget.style.display = 'none')}
          className="animate-fade-in absolute top-1/2 right-6 hidden w-[340px] -translate-y-1/2 rounded-3xl border border-white/10 shadow-[0_40px_120px_-30px_rgb(225_29_46/0.55)] xl:block 2xl:w-[400px]"
        />
        <div className="max-w-3xl">
          <p className="animate-fade-up mb-6 inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-xs font-bold tracking-[0.25em] text-brand-400 uppercase">
            <Dumbbell className="size-4" /> Musculação · Força · Performance
          </p>
          <h1 className="font-display animate-fade-up text-6xl leading-[0.9] font-bold tracking-wide text-white uppercase [animation-delay:80ms] min-[420px]:text-7xl md:text-8xl xl:text-9xl">
            Mansão
            <br />
            <span className="bg-gradient-to-r from-brand-500 to-brand-400 bg-clip-text text-transparent">Maromba</span>
          </h1>
          <p className="font-display animate-fade-up mt-6 text-xl tracking-[0.12em] text-white uppercase [animation-delay:160ms] sm:text-2xl">
            Onde a disciplina constrói resultados.
          </p>
          <p className="animate-fade-up mt-4 max-w-xl text-base leading-relaxed text-zinc-300 [animation-delay:220ms] sm:text-lg">
            Estrutura completa, equipamentos de qualidade e um ambiente criado para quem leva evolução a sério.
          </p>
          <div className="animate-fade-up mt-10 flex flex-col gap-3 [animation-delay:300ms] sm:flex-row">
            <Button size="lg" className="h-14 px-8" onClick={() => scrollToId('planos')} icon={<ArrowRight className="size-5" />}>
              Conheça nossos planos
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-8" onClick={() => scrollToId('contato')}>
              Venha treinar
            </Button>
          </div>
          <div className="animate-fade-up mt-14 grid max-w-lg grid-cols-3 gap-6 border-t border-white/10 pt-8 [animation-delay:380ms]">
            {[
              ['+500', 'Alunos'],
              ['+40', 'Equipamentos'],
              ['7 dias', 'Por semana'],
            ].map(([v, l]) => (
              <div key={l}>
                <p className="font-display text-3xl font-bold text-white">{v}</p>
                <p className="text-xs tracking-widest text-zinc-500 uppercase">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <button onClick={() => scrollToId('academia')} className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce cursor-pointer text-zinc-500 hover:text-white" aria-label="Rolar">
        <ChevronDown className="size-7" />
      </button>
    </section>
  );
}

const FEATURES = [
  { icon: Users, title: '+500 alunos', text: 'Uma comunidade que respira treino.' },
  { icon: Dumbbell, title: '+40 equipamentos', text: 'Máquinas de alto padrão e peso livre.' },
  { icon: Trophy, title: 'Professores qualificados', text: 'Acompanhamento de verdade no salão.' },
  { icon: Snowflake, title: 'Ambiente climatizado', text: 'Conforto para treinar em qualquer estação.' },
  { icon: Wrench, title: 'Área de musculação', text: 'Espaço amplo, organizado e completo.' },
  { icon: HeartPulse, title: 'Cardio', text: 'Esteiras, bikes, elípticos e escadas.' },
  { icon: ShowerHead, title: 'Vestiários', text: 'Amplos, limpos e com armários.' },
  { icon: Car, title: 'Estacionamento', text: 'Vagas exclusivas para alunos.' },
];

export function About() {
  return (
    <section id="academia" className="relative bg-ink-900 py-24 sm:py-32">
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-2">
        <div>
          <SectionTitle
            eyebrow="A academia"
            title={
              <>
                Muito mais que
                <br />
                uma <span className="text-brand-500">academia</span>
              </>
            }
            subtitle="A Mansão Maromba nasceu para quem treina com propósito. Cada detalhe — dos equipamentos ao atendimento — foi pensado para acelerar a sua evolução."
          />
          <div className="mt-10 grid gap-3 sm:grid-cols-2">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <div key={title} className="group flex gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-4 transition hover:border-brand-500/30 hover:bg-brand-500/[0.04]">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-500/10 text-brand-400 transition group-hover:bg-brand-500 group-hover:text-white">
                  <Icon className="size-5" />
                </span>
                <div>
                  <p className="font-semibold text-white">{title}</p>
                  <p className="text-sm text-zinc-500">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative">
          <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-brand-500/30 to-transparent blur-2xl" />
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-ink-700 to-ink-900">
            <Img src={ABOUT_IMAGE} alt="Aluno treinando" className="size-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-transparent" />
            <div className="absolute right-6 bottom-6 left-6 rounded-2xl border border-white/10 bg-ink-950/80 p-5 backdrop-blur">
              <div className="flex items-center gap-1 text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="size-4 fill-current" />
                ))}
              </div>
              <p className="mt-2 text-sm text-zinc-300">“Melhor estrutura da região. Equipamentos novos e professores que realmente acompanham.”</p>
              <p className="mt-2 text-xs font-semibold tracking-widest text-zinc-500 uppercase">Aluno desde 2022</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Structure() {
  return (
    <section id="estrutura" className="bg-ink-950 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionTitle eyebrow="Estrutura" title={<>Feita para <span className="text-brand-500">evoluir</span></>} subtitle="Ambientes pensados para cada etapa do seu treino." />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STRUCTURE_IMAGES.map((img, i) => (
            <div
              key={img.title}
              className={cn(
                'group relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-ink-700 to-ink-900',
                i === 0 ? 'aspect-[3/4] lg:row-span-2 lg:aspect-auto' : 'aspect-[3/4]',
              )}
            >
              <Img src={img.src} alt={img.title} className="size-full object-cover transition duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/30 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <span className="mb-2 block h-0.5 w-8 bg-brand-500 transition-all duration-500 group-hover:w-16" />
                <p className="font-display text-xl font-semibold tracking-wider text-white uppercase">{img.title}</p>
                <p className="mt-1 text-sm text-zinc-400">{img.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PlansSection({ plans, onChoose }: { plans: Plan[]; onChoose: (p: Plan) => void }) {
  return (
    <section id="planos" className="relative overflow-hidden bg-ink-900 py-24 sm:py-32">
      <div className="grid-bg absolute inset-0 opacity-40" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <SectionTitle center eyebrow="Planos" title={<>Escolha seu <span className="text-brand-500">plano</span></>} subtitle="Quanto maior o compromisso, maior a economia. Valores demonstrativos." />
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((p) => (
            <div
              key={p.id}
              className={cn(
                'relative flex flex-col rounded-3xl border p-7 transition duration-300 hover:-translate-y-1',
                p.highlight
                  ? 'border-brand-500/60 bg-gradient-to-b from-brand-500/20 via-ink-850 to-ink-850 shadow-[0_30px_80px_-30px_rgb(225_29_46/0.6)] lg:scale-[1.04]'
                  : 'border-white/10 bg-ink-850 hover:border-white/20',
              )}
            >
              {p.highlight && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-brand-500 px-4 py-1.5 text-[10px] font-bold tracking-[0.2em] whitespace-nowrap text-white uppercase">
                  Melhor custo-benefício
                </span>
              )}
              <p className="font-display text-sm font-semibold tracking-[0.3em] text-zinc-400 uppercase">Plano</p>
              <p className="font-display text-3xl font-bold tracking-wider text-white uppercase">{p.name}</p>
              <div className="mt-6">
                <span className="font-display text-5xl font-bold text-white">{formatCurrency(p.price).replace(/\s/g, ' ')}</span>
              </div>
              <p className="mt-1 text-sm text-zinc-500">
                {p.durationMonths} {p.durationMonths === 1 ? 'mês' : 'meses'}
                {p.durationMonths > 1 && <> · equivale a {formatCurrency(p.price / p.durationMonths)}/mês</>}
              </p>
              <ul className="mt-7 flex-1 space-y-3 border-t border-white/5 pt-6">
                {p.benefits.map((b) => (
                  <li key={b} className="flex items-start gap-2.5 text-sm text-zinc-300">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-500/15 text-brand-400">
                      <Check className="size-3.5" />
                    </span>
                    {b}
                  </li>
                ))}
              </ul>
              <Button size="lg" variant={p.highlight ? 'primary' : 'outline'} className="mt-8 w-full" onClick={() => onChoose(p)}>
                Quero este plano
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Partners() {
  return (
    <section id="parceiros" className="bg-ink-950 py-24 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-ink-800 to-ink-900 p-8 sm:p-14">
          <div className="absolute -top-24 -right-24 size-72 rounded-full bg-brand-500/20 blur-3xl" />
          <div className="relative grid items-center gap-10 lg:grid-cols-2">
            <SectionTitle eyebrow="Parceiros" title={<>Treine com nossos <span className="text-brand-500">parceiros</span></>} subtitle="Já é cliente Wellhub ou TotalPass? Faça seu check-in e venha treinar." />
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { name: 'Wellhub', cls: 'text-fuchsia-300', text: 'Check-in pelo app e acesso liberado na recepção.' },
                { name: 'TotalPass', cls: 'text-teal-300', text: 'Valide seu check-in e treine sem burocracia.' },
              ].map((p) => (
                <div key={p.name} className="rounded-2xl border border-white/10 bg-ink-950/60 p-6 transition hover:border-white/25">
                  <p className={cn('font-display text-3xl font-bold tracking-wide', p.cls)}>{p.name}</p>
                  <p className="mt-3 text-sm text-zinc-400">{p.text}</p>
                  <p className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest text-emerald-400 uppercase">
                    <Check className="size-4" /> Aceito aqui
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const HOURS = [
  ['Segunda a sexta', '05:00 — 23:00'],
  ['Sábado', '07:00 — 18:00'],
  ['Domingo e feriados', '08:00 — 14:00'],
];

export function Schedule() {
  const day = new Date().getDay();
  const idx = day === 0 ? 2 : day === 6 ? 1 : 0;
  return (
    <section id="horarios" className="bg-ink-900 py-24 sm:py-32">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2">
        <SectionTitle eyebrow="Horários" title={<>Aberto quando <span className="text-brand-500">você</span> precisa</>} subtitle="Horários estendidos para encaixar o treino na sua rotina." />
        <div className="space-y-3">
          {HOURS.map(([d, h], i) => (
            <div
              key={d}
              className={cn(
                'flex items-center justify-between rounded-2xl border p-6 transition',
                i === idx ? 'border-brand-500/50 bg-brand-500/10' : 'border-white/5 bg-white/[0.02]',
              )}
            >
              <div className="flex items-center gap-3">
                <Clock className={cn('size-5', i === idx ? 'text-brand-400' : 'text-zinc-500')} />
                <span className="font-semibold text-white">{d}</span>
                {i === idx && <span className="rounded-full bg-brand-500 px-2 py-0.5 text-[10px] font-bold tracking-widest text-white uppercase">Hoje</span>}
              </div>
              <span className="font-display text-2xl font-semibold tracking-wider text-white">{h}</span>
            </div>
          ))}
          <p className="pt-2 text-sm text-zinc-500">Horário de pico: 18h às 20h. Prefere treinar tranquilo? Venha pela manhã ou após as 21h.</p>
        </div>
      </div>
    </section>
  );
}

export function ContactInfo() {
  return (
    <ul className="space-y-5">
      {[
        [MapPin, 'Endereço', 'Av. dos Campeões, 1500 — São Paulo/SP'],
        [Phone, 'Telefone / WhatsApp', '(11) 4002-8922'],
        [Mail, 'E-mail', 'contato@mansaomaromba.com'],
      ].map(([Icon, label, value]) => {
        const I = Icon as typeof MapPin;
        return (
          <li key={label as string} className="flex gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand-500/10 text-brand-400">
              <I className="size-5" />
            </span>
            <div>
              <p className="text-xs tracking-widest text-zinc-500 uppercase">{label as string}</p>
              <p className="font-semibold text-white">{value as string}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
