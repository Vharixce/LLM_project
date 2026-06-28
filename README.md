een chatbot die je helpt beter worden in league of legends.

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
