async function askQuestion(e) {
    e.preventDefault()
    messages.push(["human", field.value])
    const options = {
        method: 'POST',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ messages }) // geef de hele messages array mee
    }
    const response = await fetch("http://localhost:3000/ask", options)
}


askQuestion()


