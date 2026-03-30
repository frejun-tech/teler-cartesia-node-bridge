import axios, { isAxiosError } from "axios";

interface TokenResponse {
    token: string;
}

export class CartesiaClient {
    private apiKey: string;
    private baseURL: string;
    private version: string;
    private expiresIn: number;
    private token: string | null;
    private agentId: string;
    public  wsURL: string;

    constructor(baseURL: string, apiKey: string, agentId: string, version: string = '2026-03-01', expiresIn: number = 120) {
        this.baseURL = baseURL;
        this.apiKey = apiKey;
        this.version = version;
        this.expiresIn = expiresIn;
        this.token = null;
        this.agentId = agentId;
        this.wsURL = `wss://${this.baseURL}/agents/stream/${this.agentId}`;
    }

    public getToken = async () => {
        try{
            const headers = {
                'Cartesia-Version': this.version,
                Authorization: `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            };
            const body = {grants: {tts: true, stt: true, agent: true}, expires_in: this.expiresIn};
    
            const response = await axios.post<TokenResponse>(`https://${this.baseURL}/access-token`, body, {headers});
            this.token = response?.data?.token;
            
            return (this.token) ? true : false;
        } catch (err) {
            if(isAxiosError(err)) {
                console.error("Axios Error: ", "Status: ", err.response?.status, "Reason: ", err.response?.data);
            }
            return false;
        }
    }

    public getHeaders = () => {
        const headers: Record<string, string> = {
            Authorization: `Bearer ${this.token}`,
            "Cartesia-Version": this.version,
        };
        return headers;
    }

}