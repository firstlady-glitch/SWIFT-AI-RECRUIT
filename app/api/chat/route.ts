import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
    try {
        const { message } = await req.json();
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return NextResponse.json(
                { error: "GEMINI_API_KEY is not set" },
                { status: 500 }
            );
        }

        // Add this inside the POST function to see available models in your console
        try {
            const listModelsResponse = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
            );
            const models = await listModelsResponse.json();
            console.log("Available Models:", JSON.stringify(models, null, 2));
        } catch (e) {
            console.error("Failed to list models", e);
        }

        const genAI = new GoogleGenerativeAI(apiKey);

        // FIX: Use the specific version 'gemini-1.5-flash-001'
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction: {
                parts: [{ text: "You are a helpful AI assistant for SwiftAI Recruit. Answer based on the context provided. Keep answers concise. If asked who created you, say 'I was created by King Jethro Oluwaseun'." }],
                role: "system"
            }
        });

        // Load context
        const planPath = path.join(process.cwd(), "plan", "SwiftAI Recruit.md");
        let context = "";
        try {
            context = fs.readFileSync(planPath, "utf-8");
        } catch (error) {
            console.error("Error reading context file:", error);
            context = "Information about SwiftAI Recruit is currently unavailable.";
        }

        // Pass the context in the user message or as a preamble
        const prompt = `Context: ${context}\n\nUser Question: ${message}`;

        const chat = model.startChat({
            history: [],
        });

        const result = await chat.sendMessage(prompt);
        const response = await result.response;
        const text = response.text();

        return NextResponse.json({ reply: text });
    } catch (error) {
        console.error("Error generating response:", error);
        return NextResponse.json(
            { error: "Failed to generate response" },
            { status: 500 }
        );
    }
}