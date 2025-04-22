import express from 'express'
import cors from 'cors'
import { AzureChatOpenAI } from "@langchain/openai";

const model = new AzureChatOpenAI({
    temperature: 0.5,
    verbose: false,
    maxTokens: 30 // Adjust as needed
});


const app = express()
app.use(cors())
app.use(express.json());
app.use(express.urlencoded({extended: true}));


app.get('/', async (req, res) => {
    const result = await tellJoke()
    res.json({ message: result })
})

app.post('/', async (req, res) => {
    let prompt = req.body?.prompt
    console.log("the user asked for " + prompt)
    res.json({ message: 'Hello, world!' })
})

async function tellJoke() {
    const joke = await model.invoke("Tell me a Minecraft joke!")
    return joke.content
}

app.listen(3000, () => console.log(`Server running on http://localhost:3000`))