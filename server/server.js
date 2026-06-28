// Techniek 10 punten: Basis setup met ENV file en langchain werkend in een node.js bestand.
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import path from 'path';

import { ChatGroq } from "@langchain/groq";
import { HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('./client'));

const model = new ChatGroq({
    temperature: 0.5,
    apiKey: process.env.GROQ_API_KEY,
    model: "openai/gpt-oss-120b" 
});

// Taalmodellen 50 punten: Chat history per user
const userSessions = new Map();

// Techniek 1e 30 punten: Node express server met POST request toegepast.
app.post('/ask', async (req, res) => {
    let userQuestion = req.body.message;
    if (!userQuestion && req.body.messages) {
        userQuestion = req.body.messages[req.body.messages.length - 1][1]; 
    }
    
    const userSessionId = req.body.sessionId || "default-session";

    if (!userQuestion || typeof userQuestion !== "string") {
        console.error("❌ Fout: Geen geldige tekst ontvangen van de client. req.body was:", req.body);
        res.setHeader('Content-Type', 'text/plain');
        res.write("Oeps, communicatiefoutje tussen frontend en backend. Probeer het nog eens.");
        return res.end();
    }

    if (!userSessions.has(userSessionId)) {
        userSessions.set(userSessionId, {
            // Taalmodellen 2e 30 punten: De system prompt definieert gedrag en tone of voice dat past bij de use case.
            history: [new SystemMessage("Je bent een epische League of Legends gids. Praat alsof je in de game zit. Zet belangrijke begrippen tussen **sterretjes**. Houd de antwoorden max 6 zinnen.")],
            // Taalmodellen 2e 40 punten: De node server houdt token usage bij.
            tokensUsed: 0
        });
    }

    const session = userSessions.get(userSessionId);

    // Taalmodellen 1e 40 punten: De node server houdt een chat history bij.
    session.history.push(new HumanMessage(userQuestion));
    session.tokensUsed += Math.ceil(userQuestion.length / 4);

    res.setHeader('Content-Type', 'text/plain');

    try {
        // Techniek 50 punten: Streaming toegepast.
        const stream = await model.stream(session.history);
        let finalContent = "";

        for await (const chunk of stream) {
            if (chunk.content) {
                finalContent += chunk.content;
                res.write(chunk.content);
            }
        }

        // Taalmodellen 40 punten: chat history en token usage updaten
        session.history.push(new AIMessage(finalContent));
        session.tokensUsed += Math.ceil(finalContent.length / 4);
        
        console.log(`[Sessie: ${userSessionId}] Tokens gebruikt: ~${session.tokensUsed}`);
        
        res.end(); 
    } catch (err) {
        console.error(err);
        res.write("Cannot ask a question right now. Server error.");
        res.end();
    }
});

app.listen(3000, () => console.log(`🚀 Server running on http://localhost:3000`));