import { AudioProcessor } from "../utils/audioProcessor";

export class Call {
    public id?: string;
    public isStartSent: boolean;
    public isAcked: boolean;
    public audioProcessor: AudioProcessor;

    constructor() {
        this.isStartSent = false;
        this.isAcked = false;
        this.audioProcessor = new AudioProcessor();
    }
}