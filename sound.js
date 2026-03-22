let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

function playTone(frequency, duration, type = 'sine', gain = 0.3) {
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(frequency, ctx.currentTime);
  gainNode.gain.setValueAtTime(gain, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  osc.connect(gainNode);
  gainNode.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
}

function playBell() {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  [523.25, 659.25, 783.99].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + i * 0.15);
    gainNode.gain.setValueAtTime(0.25, now + i * 0.15);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.8);
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.start(now + i * 0.15);
    osc.stop(now + i * 0.15 + 0.8);
  });
}

function playChime() {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  [880, 1108.73, 1318.51, 1760].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now + i * 0.12);
    gainNode.gain.setValueAtTime(0.2, now + i * 0.12);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.6);
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.start(now + i * 0.12);
    osc.stop(now + i * 0.12 + 0.6);
  });
}

function playDing() {
  playTone(1046.5, 0.6, 'sine', 0.3);
  setTimeout(() => playTone(1318.51, 0.4, 'sine', 0.2), 200);
}

export function playSound(type = 'bell') {
  try {
    switch (type) {
      case 'bell':
        playBell();
        break;
      case 'chime':
        playChime();
        break;
      case 'ding':
        playDing();
        break;
      default:
        playBell();
    }
  } catch {
    // Audio may not be available
  }
}
