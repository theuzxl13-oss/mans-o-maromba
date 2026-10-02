// Bipes curtos via Web Audio (sem arquivos de áudio).
let ctx: AudioContext | null = null;

export function beep(kind: 'ok' | 'error') {
  try {
    ctx ??= new AudioContext();
    const tones = kind === 'ok' ? [880, 1320] : [220, 180];
    tones.forEach((freq, i) => {
      const osc = ctx!.createOscillator();
      const gain = ctx!.createGain();
      osc.type = kind === 'ok' ? 'sine' : 'square';
      osc.frequency.value = freq;
      const start = ctx!.currentTime + i * 0.13;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.12, start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.12);
      osc.connect(gain).connect(ctx!.destination);
      osc.start(start);
      osc.stop(start + 0.13);
    });
  } catch {
    /* áudio indisponível */
  }
}
