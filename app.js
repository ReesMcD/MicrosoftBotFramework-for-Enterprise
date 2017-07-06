var fs = require('fs');
var restify = require('restify');
var builder = require('botbuilder');
var request = require('request');


// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function() {
  console.log('%s listening to %s', server.name, server.url);
});

// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
  appId: process.env.MICROSOFT_APP_ID,
  appPassword: process.env.MICROSOFT_APP_PASSWORD
});

// Listen for messages from users
server.post('/api/messages', connector.listen());

// Receive messages from the user and respond by echoing each message back (prefixed with 'You said:')
var bot = new builder.UniversalBot(connector, (session) => {
  session.send("You said: %s", session.message.text);
});

bot.dialog('help', (session, args, next) => {
  // Send message to the user and end this dialogss
  session.endDialog('This is a simple bot that collects a name and age.');
}).triggerAction({
  matches: /^help$/,
  onSelectAction: (session, args, next) => {
    // Add the help dialog to the dialog stack
    // (override the default behavior of replacing the stack)
    session.beginDialog(args.action, args);
  }
});

bot.dialog('search', (session, args, next) => {
  request('http://127.0.0.1:8080/', function(err, res, body) { // TODO: Host here is local host to for json file --> change to proxy server
    console.log(res.statusCode);
    json = JSON.parse(body)
    var results = []
    var resultArray = json['d:query']['d:PrimaryQueryResult']['d:RelevantResults']
      ['d:Table']['d:Rows']['d:element']

    for (i = 0; i < resultArray.length; i++) {
      var rowArray = resultArray[i]['d:Cells']['d:element']

      for (j = 1; j < rowArray.length; j++) {
        var title, path, result;

        if (rowArray[j]['d:Key'] == 'Title' && rowArray[j + 1]['d:Key']) {
          title = rowArray[j]['d:Value'].toString()
          path = rowArray[j + 1]['d:Value'].toString()

          result = {
            'title': title,
            'path': path
          }
          results.push(result);

        }
      }
    }
    console.log(results);
    //No message sent
  })
}).triggerAction({
  matches: /^search$/,
  onSelectAction: (session, args, next) => {
    // Add the help dialog to the dialog stack
    // (override the default behavior of replacing the stack)
    session.beginDialog(args.action, args);
  }
});

bot.dialog('choices', (session, args, next) => {
  // Send message to the user and end this dialog
  var msg = new builder.Message(session)
    .text("Thank you for expressing interest in our premium golf shirt! What color of shirt would you like?")
    .suggestedActions(
      builder.SuggestedActions.create(
        session, [
          builder.CardAction.imBack(session, "productId=1&color=green", "Green"),
          builder.CardAction.imBack(session, "productId=1&color=blue", "Blue"),
          builder.CardAction.imBack(session, "productId=1&color=red", "Red")
        ]
      ));
  session.endDialog(msg);
}).triggerAction({
  matches: /^choices$/,
  onSelectAction: (session, args, next) => {
    // Add the help dialog to the dialog stack
    // (override the default behavior of replacing the stack)
    session.beginDialog(args.action, args);
  }
});
