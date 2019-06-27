"use strict";
const Alexa = require('alexa-sdk');
const APP_ID = 'amzn1.ask.skill.ef0670dd-6332-44d3-8393-0913e4793ecf';
var parsedUrls = ["www.sciencedaily.com"]; //add more urls once a parser is built for them

var HELP_MESSAGE = "You can ask me what's new in a Field of Study, like Math, or you can say exit.";
var HELP_REPROMPT = "What can I help you with?";
var STOP_MESSAGE = "Stay Relevant! Goodbye!";
var dynasty = require('dynasty')({});

var ALL_MAJORS = getMajors();

exports.handler = (event, context) => {
  const alexa = Alexa.handler(event, context);
  alexa.APP_ID = APP_ID;
  alexa.dynamoDBTableName = 'DominionAttributes';
  // To enable string internationalization (i18n) features, set a resources object.
  //alexa.dynamoDBTableName = 'Facts';
  //alexa.resources = languageStrings;
  alexa.registerHandlers(handlers);
  alexa.execute();
};

const handlers = {
  'SayHello': function () {
    this.emit(':tell', 'ASaah Dude!');
  },
  'GenerateDeck': function () {
    this.sessionAttributes['name'] = 'Bob';
  },
  'LaunchRequest': function () {
    this.emit(':ask', "Welcome to Relevant Student. You can say: what's new in Engineering. You can also simply say a Field of Study.",
      "Give me a Field of Study to get relevant info.");
  },
  'AMAZON.HelpIntent': function () {
    var speechOutput = HELP_MESSAGE;
    var reprompt = HELP_REPROMPT;
    this.emit(':ask', speechOutput, reprompt);
  },
  'AMAZON.CancelIntent': function () {
    this.emit(':tell', 'canceled');
  },
  'AMAZON.StopIntent': function () {
    this.emit(':tell', STOP_MESSAGE);
  },
  'SessionEndedRequest': function () {
    console.log('session ended!');
    this.emit(':tell', STOP_MESSAGE);
  }
};

function isValidSlot(intent) {
  var validSlot = intent && intent.slots && intent.slots.FIELDOFSTUDY &&
    intent.slots.FIELDOFSTUDY.value;
  return validSlot;
}

function getTop5(major, callback) {
  var query = major.replace(" ", "%20") + "%20News";
  var urlArray = [];
  var apiKey = "f23a214625264589a181459a3904fbae";
  var options = {
    url: "https://api.cognitive.microsoft.com/bing/v5.0/search?q=" + query,
    headers: {
      'Ocp-Apim-Subscription-Key': apiKey,
      'textDecorations': false
    }
  }
  console.log("about to request");
  setTimeout(() => {
    reqprom(options)
      .then((body) => {
          console.log('running');
          var info = JSON.parse(body);
          for (var i in [0, 1, 2, 3, 4]) {
            var searchResult = info.webPages.value[i];
            console.log(searchResult.name);
            urlArray.push({
              url: searchResult.url,
              name: searchResult.name
            });
          }
          if (urlArray.length == 0) {
            urlArray = [{
              url: "",
              name: "blank"
            }];
          }
          callback(urlArray);
        },
        (error) => {
          return [];
        });
  }, 200);
}

function getArticle(url, callback) {
  var baseurl = url.includes("www.sciencedaily.com") ? "sciencedaily" : null; //do checks for future urls that we parse and add to the list
  url = decodeURIComponent(url.match(/www.sciencedaily.com.*(?=&p.*)/)[0]);
  switch (baseurl) {
    case "sciencedaily":
      //request the url, run jquery on it and get the first article. Or list of 5 articles
      url = "http://" + url.replace("www", "rss").replace("news/", "").replace(/\/$/, ".xml");
      var feedparser = new FeedParser({
        feedurl: url
      });
      var req = request(url);

      req.on('response', function (res) {
        var stream = this; // `this` is `req`, which is a stream

        if (res.statusCode !== 200) {
          this.emit('error', new Error('Bad status code'));
        } else {
          stream.pipe(feedparser);
        }
      });

      feedparser.on('error', function (error) {
        // always handle errors
        var stream = this;
        this.emit('error', new Error('Error parsing response'));
      });

      feedparser.on('readable', function () {
        // This is where the action is!
        var stream = this; // `this` is `feedparser`, which is a stream
        var meta = this.meta; // **NOTE** the "meta" is always available in the context of the feedparser instance
        var item;
        var counter = 0;
        var articleArray = [];
        while (item = stream.read()) {
          articleArray.push({
            url: item.link,
            title: item.title
          });
        }
        var articleTitle = articleArray[0].title;
        //or if random() then get random articleTitle
        //or if next() then get the next one?
        callback(articleTitle);
      });
      break;
      /*case "url2":
        break;
      case "url3":
        break;
      case "url4":
        break;
      case "url5":
        break;*/
    default:
      return "try again";
      break;
  }
}

function getJSON(callback) {
  var body = ''
  var reply = 'nothin'
  var apiKey = '4ac0ec9992af4a078cc87bd6fd651741';
  request.get(url(), function (error, response, body) {
    reply = JSON.parse(body).articles[0].title;
    if (reply.length > 0) {
      callback(reply);
    } else {
      callback("ERROR");
    }
  });
}

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {

}

// ------- Skill specific logic -------

function getWelcomeResponse(callback) {
  var speechOutput = "Welcome! Do you want to hear about some facts?"

  var reprompt = "Do you want to hear about some facts?"

  var header = "Get Info"

  var shouldEndSession = false

  var sessionAttributes = {
    "speechOutput": speechOutput,
    "repromptText": reprompt
  }

  callback(sessionAttributes, buildSpeechletResponse(header, speechOutput, reprompt, shouldEndSession))

}
