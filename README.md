Een chatbot waarmee je alles kunt vragen over Minecraft! Deze applicatie maakt gebruik van Azure OpenAI via een Node.js server en een client-side frontend gebouwd in HTML, CSS en JavaScript.
Functies

    Stel vragen over Minecraft blokken, mobs, biomen, crafting recepten en meer!
    Chatgeschiedenis wordt opgeslagen en bijgehouden met rollen zoals systeem, mens en assistent.
    Streaming: antwoorden verschijnen woord voor woord.
    Gebruikt embeddings van een eigen document (minecraft_machines.txt)
    API-sleutels worden veilig opgeslagen in een .env bestand.


Installatie-instructies



Installeer de benodigde pakketten:

npm install

Maak een .env bestand aan:

AZURE_OPENAI_API_KEY=jouw-api-sleutel
AZURE_OPENAI_API_INSTANCE_NAME=jouw-instantie-naam
AZURE_OPENAI_API_DEPLOYMENT_NAME=jouw-deployment-naam
AZURE_OPENAI_API_EMBEDDINGS_DEPLOYMENT_NAME=jouw-embeddings-deployment
AZURE_OPENAI_API_VERSION=jouw-api-versie

Maak de vectorstore aan:

node --env-file=.env makeVector.js

Start de server+client:

npm run server
npm run dev

Open de client/index.html met Live Server of host de applicatie
