simple-ms-bot
===

A quick example of some of the things that can be done with Microsoft Bot Framework. A hackathon project for work (in which we won), but with proprietary information/data extracted away. A good starting place for building quick bots that run on Azure/Bot Service.

### Dependencies
* Node.JS & NPM
* [Microsoft Bot Framework Emulator](https://github.com/Microsoft/BotFramework-Emulator/releases)
* BotBuilder
* Restify
* Request
* Q

The NPM package dependencies are resolved with `npm install`.

### Getting Started

1. `git clone https://github.com/sc1f/simple-ms-bot`
2. `cd simple-ms-bot && npm install`
3. `node app.js`
4. Open the Bot Framework Emulator, and set the url to to `http://localhost:3978/api/messages`
5. Start typing! Try `help`, `calendar`, `search`, and `links`.
