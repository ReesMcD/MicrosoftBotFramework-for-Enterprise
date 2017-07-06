var fs = require('fs'),
    restify = require('restify'),
    builder = require('botbuilder'),
    request = require('request');

// Utils
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

// Utility func
function timeNow() {
    var d = new Date(),
        h = d.getHours(),
        m = (d.getMinutes() < 10 ? '0' : '') + d.getMinutes();
    return h + ':' + m;
}

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});

// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

// Listen for messages from users
server.post('/api/messages', connector.listen());

var bot = new builder.UniversalBot(connector, (session) => {
    session.send('Sorry, I did not understand \'%s\'. Type \'help\' if you need assistance.', session.message.text);
});

//var model = 'https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/9e7549e3-3be9-424f-a31b-085a07368e6e?subscription-key=f1e62db652474312841722be53244c86&verbose=true&timezoneOffset=0&q=';
//bot.recognizer(new builder.LuisRecognizer(model));

// Help dialog
bot.dialog('help', (session, args, next) => {
    //var intent = args.intent;
    session.sendTyping();
    var help_card = new builder.HeroCard(session)
        .title('Hi, I\'m ERIC.')
        .images([
            builder.CardImage.create(session, 'http://www.pngpix.com/wp-content/uploads/2016/07/PNGPIX-COM-Textron-Logo-PNG-Transparent.png')
        ])
        .subtitle("It's " + timeNow() + ", what would you like to do?")
        .text('Click one of the buttons below to get started.')
        .buttons([
            builder.CardAction.imBack(session, 'search', 'Search'),
            builder.CardAction.imBack(session, 'bookmarks', 'Bookmarks'),
            builder.CardAction.imBack(session, 'calendar', 'Calendar'),
        ]);
    var help_msg = new builder.Message(session).addAttachment(help_card);
    session.endDialog(help_msg)
}).triggerAction({
    matches: /^(help|problem)$/,
    onSelectAction: (session, args, next) => {
        // Add the help dialog to the dialog stack
        // (override the default behavior of replacing the stack)
        session.beginDialog(args.action, args);
    }
});

// Search dialog
bot.dialog('search', (session, args, next) => {
    var intent = args.intent;
    session.sendTyping();
    var results = [
        new builder.HeroCard(session)
            .title('ERIC Search Results')
            .subtitle('2 Results'),
        new builder.HeroCard(session)
            .title('Azure Storage')
            .subtitle('Offload the heavy lifting of data center management')
            .text('Store and help protect your data. Get durable, highly available data storage across the globe and pay only for what you use.')
            .buttons([
                builder.CardAction.openUrl(session, 'https://azure.microsoft.com/en-us/services/storage/', 'Learn More')
            ]),
        new builder.ThumbnailCard(session)
            .title('DocumentDB')
            .subtitle('Blazing fast, planet-scale NoSQL')
            .text('NoSQL service for highly available, globally distributed apps—take full advantage of SQL and JavaScript over document and key-value data without the hassles of on-premises or virtual machine-based cloud database options.')
            .buttons([
                builder.CardAction.openUrl(session, 'https://azure.microsoft.com/en-us/services/documentdb/', 'Learn More')
            ])
    ];
    //ConstructSearchResults(session);
    var reply = new builder.Message(session)
        .attachmentLayout(builder.AttachmentLayout.list)
        .attachments(results);

    session.send(reply);
}).triggerAction({
    matches: /^(search|find|eric)$/,
    onSelectAction: (session, args, next) => {
        // Add the help dialog to the dialog stack
        // (override the default behavior of replacing the stack)
        session.beginDialog(args.action, args);
    }
});

// Bookmarks dialog
bot.dialog('bookmarks', (session, args, next) => {
    //var intent = args.intent;
    session.sendTyping();
    // Send message to the user and end this dialog
    var msg = new builder.Message(session)
        .text("Here are the bookmarks you use most frequently:")
        .suggestedActions(
            builder.SuggestedActions.create(
                session, [
                    builder.CardAction.openUrl(session, 'https://www.microsoft.com/en-us/windows/cortana', 'Pay & Benefits'),
                    builder.CardAction.openUrl(session, 'https://www.microsoft.com/en-us/windows/cortana', 'Service Requests'),
                    builder.CardAction.openUrl(session, 'https://www.microsoft.com/en-us/windows/cortana', 'ERIC-TV')
                ]
            ));
    session.endDialog(msg);
}).triggerAction({
    matches: /^(bookmarks|frequent|links|used)$/,
    onSelectAction: (session, args, next) => {
        // Add the help dialog to the dialog stack
        // (override the default behavior of replacing the stack)
        session.beginDialog(args.action, args);
    }
});

// Calendar dialog

bot.dialog('calendar', (session, args, next) => {
    //var intent = args.intent;
    session.sendTyping();
    //var calendarEntity = builder.EntityRecognizer.findEntity(intent.entities, 'Calendar')
    // Send message to the user and end this dialog
    var appointments = getRandomInt(1, 6);
    var next_appointment = getRandomInt(1, 12);
    var time = "AM";

    if (appointments > 3) {
        var comment = "Your day's looking busy!";
    } else {
        comment = "Your schedule's pretty clear."
    }

    next_appointment < 8 ? time = 'PM' : time = 'AM';

    var calendar_card = new builder.HeroCard(session)
        .title(comment)
        .subtitle('You have ' + appointments + ' appointments coming up today.')
        .text('Your next appointment is at ' + next_appointment + time + '.');

    session.endDialog(new builder.Message(session).addAttachment(calendar_card))
}).triggerAction({
    matches: /^(calendar|appointments|schedule|busy)$/,
    onSelectAction: (session, args, next) => {
        // Add the help dialog to the dialog stack
        // (override the default behavior of replacing the stack)
        session.beginDialog(args.action, args);
    }
});

// Construct search results

function ConstructSearchResults(session) {
    var results = [];
    return [
        new builder.HeroCard(session)
            .title('Azure Storage')
            .subtitle('Offload the heavy lifting of data center management')
            .text('Store and help protect your data. Get durable, highly available data storage across the globe and pay only for what you use.')
            .images([
                builder.CardImage.create(session, 'https://docs.microsoft.com/en-us/azure/storage/media/storage-introduction/storage-concepts.png')
            ])
            .buttons([
                builder.CardAction.openUrl(session, 'https://azure.microsoft.com/en-us/services/storage/', 'Learn More')
            ]),
        /*
         new builder.ThumbnailCard(session)
         .title('DocumentDB')
         .subtitle('Blazing fast, planet-scale NoSQL')
         .text('NoSQL service for highly available, globally distributed apps—take full advantage of SQL and JavaScript over document and key-value data without the hassles of on-premises or virtual machine-based cloud database options.')
         .images([
         builder.CardImage.create(session, 'https://docs.microsoft.com/en-us/azure/documentdb/media/documentdb-introduction/json-database-resources1.png')
         ])
         .buttons([
         builder.CardAction.openUrl(session, 'https://azure.microsoft.com/en-us/services/documentdb/', 'Learn More')
         ]),

         new builder.HeroCard(session)
         .title('Azure Functions')
         .subtitle('Process events with a serverless code architecture')
         .text('An event-based serverless compute experience to accelerate your development. It can scale based on demand and you pay only for the resources you consume.')
         .images([
         builder.CardImage.create(session, 'https://azurecomcdn.azureedge.net/cvt-5daae9212bb433ad0510fbfbff44121ac7c759adc284d7a43d60dbbf2358a07a/images/page/services/functions/01-develop.png')
         ])
         .buttons([
         builder.CardAction.openUrl(session, 'https://azure.microsoft.com/en-us/services/functions/', 'Learn More')
         ]),

         new builder.ThumbnailCard(session)
         .title('Cognitive Services')
         .subtitle('Build powerful intelligence into your applications to enable natural and contextual interactions')
         .text('Enable natural and contextual interaction with tools that augment users\' experiences using the power of machine-based intelligence. Tap into an ever-growing collection of powerful artificial intelligence algorithms for vision, speech, language, and knowledge.')
         .images([
         builder.CardImage.create(session, 'https://azurecomcdn.azureedge.net/cvt-68b530dac63f0ccae8466a2610289af04bdc67ee0bfbc2d5e526b8efd10af05a/images/page/services/cognitive-services/cognitive-services.png')
         ])
         .buttons([
         builder.CardAction.openUrl(session, 'https://azure.microsoft.com/en-us/services/cognitive-services/', 'Learn More')
         ])*/
    ];
}


/*v
 */
/*  request('https://jsonplaceholder.typicode.com/posts/1', function(err, res, body) {
 json = JSON.parse(body);
 console.log(json);
 output = json.id ;//Change to needed data
 session.endDialogWithResult(output.toString());
 });*/