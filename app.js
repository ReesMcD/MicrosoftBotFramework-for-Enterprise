var fs = require('fs'),
    restify = require('restify'),
    builder = require('botbuilder'),
    request = require('request'),
    Q = require('q');

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
bot.dialog('search', [
    (session) => {
        //var intent = args.intent;
        session.sendTyping();
        builder.Prompts.text(session, 'What would you like to search for?');
    },(session, results) => {
        session.sendTyping();
        var query = results.response;
        GetSearchResults(query).then(
            function(data) {
                var deferred = Q.defer();
                var cards = [
                    new builder.HeroCard(session)
                        .title("ERIC search for " + '"' + query + '"')
                        .subtitle(data.length + " results"),
                ];
                for(var i = 0; i < data.length; i++) {
                    var new_card = new builder.HeroCard(session)
                        .subtitle(data[i].title)
                        .buttons([
                            builder.CardAction.openUrl(session, data[i].path, 'Open')
                        ]);
                    cards.push(new_card);
                }
                deferred.resolve(cards);
                return deferred.promise;
            }
        ).then(function(data) {
                var reply = new builder.Message(session)
                    .attachmentLayout(builder.AttachmentLayout.list)
                    .attachments(data);
                session.endDialog(reply);
            });

    }]).triggerAction({
    matches: /^(search|find)$/
});

// Bookmarks dialog
bot.dialog('bookmarks', (session, args, next) => {
    //var intent = args.intent;
    session.sendTyping();
    // Send message to the user and end this dialog
    var msg = new builder.Message(session)
        .text("Here are links you've bookmarked.")
        .suggestedActions(
            builder.SuggestedActions.create(
                session, [
                    builder.CardAction.openUrl(session, 'https://www.microsoft.com/en-us/windows/cortana', 'Pay & Benefits'),
                    builder.CardAction.openUrl(session, 'https://www.microsoft.com/en-us/windows/cortana', 'Service Requests'),
                    builder.CardAction.openUrl(session, 'https://textron.mc.kontiki.com/global2/home', 'ERIC-TV')
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
var GetSearchResults = function(query) {
    var deferred = Q.defer();
    var url;
    console.log(deferred);
    if(query == 'kautex') {
      url = 'http://localhost:8000/example1.json';
    } else if(query == 'bell'){
      url = 'http://localhost:8000/example2.json';
    }

    request(url, function(err, res, body) {
        // TODO: Host here is local host to for json file --> change to proxy server
        if(err) {
            deferred.reject(err);
        }
        console.log(res.statusCode);
        var json = JSON.parse(body);
        var resultArray = json['d:query']['d:PrimaryQueryResult']['d:RelevantResults']['d:Table']['d:Rows']['d:element'];
        var results = [];

        for (var i = 0; i < resultArray.length; i++) {
            var rowArray = resultArray[i]['d:Cells']['d:element'];

            for (j = 1; j < rowArray.length; j++) {
                var title, path, result;

                if (rowArray[j]['d:Key'] === 'Title' && rowArray[j + 1]['d:Key']) {
                    title = rowArray[j]['d:Value'].toString();
                    path = rowArray[j + 1]['d:Value'].toString();

                    result = {
                        'title': title,
                        'path': path
                    };

                    results.push(result);
                }
            }
        }
        deferred.resolve(results);
        console.log(deferred);
    });
    return deferred.promise;
};

var ConstructSearchResults = function(data, session) {
    var deferred = Q.defer();
    console.log("CONSTRUCT " + JSON.stringify(data));
    var cards = [];
    for(var i = 0; i < data.length; i++) {
        var new_card = new builder.HeroCard(session)
            .title(data[i].title)
            .buttons([
                builder.CardAction.openUrl(session, data[i].path, 'Open')
            ]);
        cards.push(new_card);
    }
    console.log("CARDS " +cards);
    deferred.resolve(cards);
    return deferred.promise;
};
