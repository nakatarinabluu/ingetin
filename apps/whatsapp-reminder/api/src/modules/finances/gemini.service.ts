import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { env } from '../../core/config';
import { logger } from '@ingetin/logger';
import { z } from 'zod';

export const ParsedTransactionSchema = z.object({
    intent: z.enum(['RECORD_INCOME', 'RECORD_EXPENSE', 'UPDATE_LIMIT', 'GET_SUMMARY', 'UNKNOWN']),
    amount: z.number().optional(),
    description: z.string().optional(),
    category: z.string().optional(),
    monthlyLimit: z.number().optional()
});

export type ParsedTransaction = z.infer<typeof ParsedTransactionSchema>;

export class GeminiService {
    private genAI: GoogleGenerativeAI;
    private model: GenerativeModel;
    private MAX_RETRIES = 2;

    constructor() {
        this.genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
        this.model = this.genAI.getGenerativeModel({ 
            model: 'gemini-1.5-flash',
            generationConfig: {
                responseMimeType: "application/json"
            }
        });
    }

    /**
     * Parse financial messages with retry logic and "dirty" fallback cleaning
     */
    async parseFinanceMessage(message: string): Promise<ParsedTransaction> {
        let attempt = 0;
        
        while (attempt <= this.MAX_RETRIES) {
            try {
                const prompt = this.buildPrompt(message);
                const result = await this.model.generateContent(prompt);
                const response = await result.response;
                const text = response.text();
                
                // 1. "Dirty" Cleaning: Extract JSON using regex just in case AI adds fluff
                const cleanedJson = this.extractJson(text);
                if (!cleanedJson) throw new Error('No valid JSON block found in AI response');

                const rawJson = JSON.parse(cleanedJson);
                
                // 2. Schema Validation
                const parsed = ParsedTransactionSchema.safeParse(rawJson);
                if (parsed.success) return parsed.data;

                throw new Error('AI output failed schema validation');

            } catch (error) {
                attempt++;
                logger.warn({ 
                    msg: `Gemini parsing attempt ${attempt} failed`, 
                    error: (error as Error).message,
                    message 
                });
                
                if (attempt > this.MAX_RETRIES) break;
                // Exponential backoff or small delay before retry
                await new Promise(r => setTimeout(r, 1000 * attempt));
            }
        }

        return { intent: 'UNKNOWN' };
    }

    /**
     * The "Dirty" Janitor: Extracts the first JSON object from a string using Regex.
     * Essential for handling AI hallucinations.
     */
    private extractJson(text: string): string | null {
        try {
            // Regex to find content between first { and last }
            const match = text.match(/\{[\s\S]*\}/);
            if (!match) return null;
            
            let jsonCandidate = match[0];
            
            // Clean common AI garbage
            jsonCandidate = jsonCandidate
                .replace(/\\n/g, '') // remove newlines
                .replace(/\\"/g, '"') // fix escaped quotes
                .trim();

            return jsonCandidate;
        } catch (e) {
            return null;
        }
    }

    private buildPrompt(message: string): string {
        return `
            You are a financial assistant for a WhatsApp bot called "Ingetin".
            Task: Parse user financial messages.
            Current Date: ${new Date().toISOString()}
            
            Rules:
            1. RECORD_EXPENSE: "beli kopi 5rb", "makan siang 20k"
            2. RECORD_INCOME: "gaji 5jt", "freelance 1jt"
            3. UPDATE_LIMIT: "set limit jajan 2jt"
            4. GET_SUMMARY: "cek pengeluaran", "sisa saldo"
            5. Conversions: "rb/k" -> 1000, "jt" -> 1000000
            6. Categories: FOOD, TRANSPORT, BILLS, ENTERTAINMENT, OTHERS
            
            STRICT OUTPUT FORMAT (JSON ONLY):
            {
                "intent": "RECORD_EXPENSE" | "RECORD_INCOME" | "UPDATE_LIMIT" | "GET_SUMMARY" | "UNKNOWN",
                "amount": number,
                "description": "string",
                "category": "string",
                "monthlyLimit": number
            }

            Message: "${message}"
        `;
    }
}
