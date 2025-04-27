// client/app.js

const form = document.getElementById("chat-form");
const field = document.getElementById("field");
const conversationEl = document.getElementById("conversation");
const messages = [];

form.addEventListener("submit", askQuestion);

// Kick off with the bot’s welcome
startConversation();

async function startConversation() {
    const res = await fetch("http://localhost:3000/ask", {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [] })
    });

    // Handle the initial bot response
    const { message } = await res.json();
    messages.push(["bot", "Ask me anything about Minecraft or weather!"]); // New first message
    renderConversation();
}

async function askQuestion(e) {
    e.preventDefault();
    messages.push(["human", field.value]);
    renderConversation();

    // Make the request to the server and handle the streamed response
    const res = await fetch("http://localhost:3000/ask", {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages })
    });

    // Handle the response as a stream
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let done = false;
    let text = '';

    while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        text += decoder.decode(value, { stream: true });

        // Update the conversation with the current part of the response
        renderConversationStreaming(text);
    }

    // Push the final completed message to the messages array
    messages.push(["bot", text]);
    field.value = "";
}

function renderConversation() {
    // Render the entire conversation (initial and completed messages)
    conversationEl.innerHTML = "";
    for (const [speaker, text] of messages) {
        const p = document.createElement("p");
        p.textContent = `${speaker === "human" ? "You" : "Bot"}: ${text}`;
        p.className = speaker; // Add class for styling
        conversationEl.appendChild(p);
    }
}

function renderConversationStreaming(text) {
    // Update the conversation progressively with the streamed text
    const lastMessage = conversationEl.lastElementChild;
    if (lastMessage && lastMessage.textContent.startsWith("Bot:")) {
        lastMessage.textContent = `Bot: ${text}`;
    } else {
        // If no last message, create a new one
        const p = document.createElement("p");
        p.textContent = `Bot: ${text}`;
        p.className = 'bot'; // Add class for styling
        conversationEl.appendChild(p);
    }
}
