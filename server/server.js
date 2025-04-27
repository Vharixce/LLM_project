import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import { AzureChatOpenAI } from "@langchain/openai"
import fs from 'fs'
import path from 'path'
import fetch from 'node-fetch'

// 1) Load environment variables
dotenv.config()

// 2) Instantiate Express
const app = express()

// 3) Enable CORS for every origin (dev only!)
app.use(cors())
app.use(express.json())

// 4) Instantiate your Azure-backed chat model
const model = new AzureChatOpenAI({
    temperature: 0.5,
    verbose: false,
    maxTokens: 500
})

// 5) Read the minecraft_machines.txt file and load the data
const filePath = path.resolve('./data/minecraft_machines.txt')

// Function to load the data from the file
const loadMinecraftMachinesData = () => {
    try {
        // Check if the file exists
        if (!fs.existsSync(filePath)) {
            console.error('File not found:', filePath)
            return null
        }

        // Read the content of the file
        const data = fs.readFileSync(filePath, 'utf8')
        return data
    } catch (err) {
        console.error('Error loading minecraft_machines.txt:', err)
        return null
    }
}

// Function to get live weather data
const getCurrentTemperature = async () => {
    let currentTemperature = "data unavailable";
    try {
        const response = await fetch("https://api.open-meteo.com/v1/forecast?latitude=51.92&longitude=4.48&current_weather=true");
        if (response.ok) {
            const weatherData = await response.json();
            if (weatherData?.current_weather?.temperature !== undefined) {
                const temp = weatherData.current_weather.temperature;
                const unit = weatherData.current_weather_units?.temperature || "°C";
                currentTemperature = `${temp}${unit}`;
            }
        }
    } catch (error) {
        console.error("Weather fetch error:", error);
    }
    return currentTemperature;
}

// 6) Health-check endpoint
app.get('/', (_req, res) => {
    res.json({ status: 'OK' })
})

// 7) Chat endpoint with streaming effect
app.post('/ask', async (req, res) => {
    try {
        const { messages } = req.body
        if (!Array.isArray(messages)) {
            return res.status(400).json({ error: 'Invalid payload' })
        }

        // Load the Minecraft machines data from the file
        const minecraftData = loadMinecraftMachinesData()
        if (!minecraftData) {
            return res.status(500).json({ error: 'Failed to load Minecraft machine data' })
        }

        // Fetch current temperature
        const currentTemperature = await getCurrentTemperature();

        // === Build the full prompt with temperature ===
        let prompt = `You are a friendly, expert assistant that only answers questions about Minecraft, or the weather`
        prompt += ` If the user asks anything outside of Minecraft or the weather, respond with:`
        prompt += ` "Sorry, I only answer Minecraft/weather-related questions."`
        prompt += `\n\nMinecraft Machines Data:\n`
        prompt += minecraftData // Add the content of the file as context
        prompt += `\n\nCurrent Temperature: ${currentTemperature}\n`
        prompt += `\n\nThe conversation so far:\n`

        for (const [speaker, text] of messages) {
            if (speaker === 'human') {
                prompt += `Human: ${text}\n`
            } else {
                prompt += `Assistant: ${text}\n`
            }
        }
        prompt += `Assistant:`

        // === Invoke the model with the prompt ===
        const completion = await model.invoke(prompt)

        // === Simulate the word-by-word typing effect and stream the response ===
        const words = completion.content.split(" ")
        res.setHeader('Content-Type', 'text/plain')  // Set response to text
        res.flushHeaders()

        for (const word of words) {
            res.write(word + " ")  // Send each word with a space after it
            await new Promise(resolve => setTimeout(resolve, 50))  // Wait before sending the next word
        }

        // End the response after all words are sent
        res.end()

    } catch (err) {
        console.error('Error in /ask:', err)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// 8) Start listening
const PORT = 3000
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
})
