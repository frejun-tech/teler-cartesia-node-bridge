/**
 * Smoothing / Blur — a low-pass filter
 */
class BiquadLowPass {
    private b0: number; private b1: number; private b2: number;
    private a1: number; private a2: number;
    private x1: number; private x2: number; private y1: number; private y2: number;

    constructor(sampleRate: number, cutoffFreq: number, Q = Math.SQRT1_2) {
        const w0 = 2 * Math.PI * cutoffFreq / sampleRate;
        const cosW0 = Math.cos(w0);
        const alpha = Math.sin(w0) / (2 * Q);

        const b0 = (1 - cosW0) / 2, b1 = 1 - cosW0, b2 = (1 - cosW0) / 2;
        const a0 = 1 + alpha, a1 = -2 * cosW0, a2 = 1 - alpha;

        this.b0 = b0 / a0; this.b1 = b1 / a0; this.b2 = b2 / a0;
        this.a1 = a1 / a0; this.a2 = a2 / a0;
        this.x1 = 0; this.x2 = 0; this.y1 = 0; this.y2 = 0;
    }

    process(x0: number): number {
        const y0 = this.b0 * x0 + this.b1 * this.x1 + this.b2 * this.x2
            - this.a1 * this.y1 - this.a2 * this.y2;
        this.x2 = this.x1; 
        this.x1 = x0;
        this.y2 = this.y1; 
        this.y1 = y0;
        return y0;
    }
}

/**
 * Decimate + full resampler class
 */
export class AudioProcessor {
    private cartesiaOutputRate: number;

    private TelerInputRate: number;

    private downSamplingFactor: number;

    private filters: BiquadLowPass[];
    private sampleCounter: number;

    constructor() {
        this.TelerInputRate = 8000; // Teler input sample rate
        
        this.cartesiaOutputRate = 16000; // Cartesia output sample rate
        
        this.downSamplingFactor = this.cartesiaOutputRate / this.TelerInputRate; // 3 — keep 1 of every 3

        // Cutoff a bit below the new Nyquist (4000Hz) leaves safety margin
        const cutoff = this.TelerInputRate / 2 * 0.8; // ~3200 Hz

        // Chain 4 filters = a stronger, steeper blur (more thorough than 1 pass)
        this.filters = [1, 2, 3, 4].map(() => new BiquadLowPass(this.cartesiaOutputRate, cutoff));

        this.sampleCounter = 0; // persists across chunks so the "every 3rd" pattern stays aligned
    }

    public downsample(audioData: Buffer): Buffer {
        const int16 = new Int16Array(audioData.buffer, audioData.byteOffset, audioData.length / 2);
        const out: number[] = [];

        for (let i = 0; i < int16.length; i++) {
            let sample = int16[i] / 32768; // Int16 -> Float32 range (-1 to 1)

            // Step A: smooth / blur
            for (const f of this.filters) sample = f.process(sample);

            // Step B: thin out, keeping 1 sample out of 3
            if (this.sampleCounter % this.downSamplingFactor === 0) {
                const clamped = Math.max(-1, Math.min(1, sample));
                out.push(Math.round(clamped * 32767)); // Float32 -> Int16
            }
            this.sampleCounter++;
        }

        const outInt16 = Int16Array.from(out);
        return Buffer.from(outInt16.buffer, outInt16.byteOffset, outInt16.byteLength);
    }
}