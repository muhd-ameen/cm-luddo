import { Howl } from "howler";

const WAV_HEADER_SIZE = 44;

const toWavDataUri = (samples: Float32Array, sampleRate = 22050) => {
  const buffer = new ArrayBuffer(WAV_HEADER_SIZE + samples.length * 2);
  const view = new DataView(buffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i += 1) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeString(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, "data");
  view.setUint32(40, samples.length * 2, true);

  let offset = WAV_HEADER_SIZE;
  for (let i = 0; i < samples.length; i += 1) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s * 32767, true);
    offset += 2;
  }

  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }

  return `data:audio/wav;base64,${btoa(binary)}`;
};

const createTone = (
  frequencies: number[],
  durationMs: number,
  sampleRate = 22050,
  gain = 0.2
) => {
  const length = Math.floor((durationMs / 1000) * sampleRate);
  const samples = new Float32Array(length);

  for (let i = 0; i < length; i += 1) {
    const t = i / sampleRate;
    const env = Math.exp((-4 * i) / length);
    let frame = 0;

    frequencies.forEach((f, index) => {
      frame += Math.sin(2 * Math.PI * (f + index * 12) * t) / frequencies.length;
    });

    samples[i] = frame * env * gain;
  }

  return toWavDataUri(samples, sampleRate);
};

class SoundEngine {
  private unlocked = false;

  private roll = new Howl({ src: [createTone([420, 620], 330)] });

  private step = new Howl({ src: [createTone([880], 110, 16000, 0.14)] });

  private win = new Howl({ src: [createTone([520, 660, 920], 760)] });

  unlock() {
    if (this.unlocked) return;
    this.unlocked = true;
  }

  playRoll() {
    this.unlock();
    this.roll.play();
  }

  playStep() {
    this.step.play();
  }

  playWin() {
    this.win.play();
  }
}

export const soundEngine = new SoundEngine();
