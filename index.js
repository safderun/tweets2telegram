const Slimbot = require("slimbot");
const {
  telegram_api_key,
  consumer_key,
  consumer_secret,
  access_token,
  access_token_secret,
  chat_id,
} = require("./secret.json");
const Twitter = require("twitter");

const slimbot = new Slimbot(telegram_api_key);

const client = new Twitter({
  consumer_key: consumer_key,
  consumer_secret: consumer_secret,
  access_token_key: access_token,
  access_token_secret: access_token_secret,
});

////////////////////////////
var subscribedChatIds = [];

slimbot.on("message", (message) => {
  if (message.text == "/start") {
    slimbot.sendMessage(
      message.chat.id,
      "Welcome To Latest Important Crypto News\nSend /subscribe to subcribe the bot\nSend /unsubscribe to unsubscribe from the bot."
    );
  } else if (message.text.toLowerCase() == "/subscribe") {
    if (!subscribedChatIds.includes(message.chat.id)) {
      subscribedChatIds.push(message.chat.id);
      slimbot.sendMessage(message.chat.id, "Subscribed To Crypto News!");
    } else {
      slimbot.sendMessage(
        message.chat.id,
        "You Are Already Subscribed To Crypto News!"
      );
    }
  } else if (message.text.toLowerCase() == "/unsubscribe") {
    if (subscribedChatIds.includes(message.chat.id)) {
      subscribedChatIds.push(message.chat.id);
      slimbot.sendMessage(message.chat.id, "Unsubscribed From Crypto News!");
    } else {
      slimbot.sendMessage(
        message.chat.id,
        "You Haven't Subscribed To Crypto News!"
      );
    }
  }
});

///////////////////////////////

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

async function getLastTweet() {
  var savedTweet = "";

  while (true) {
    var params = { list_id: "1432403151492091911", tweet_mode: "extended" };
    client.get(
      "lists/statuses.json",
      params,
      function (error, tweets, response) {
        if (!error && tweets.length > 0) {
          const lastTweet = tweets[0];
          if (lastTweet.full_text != savedTweet) {
            const message = createMessage(
              titleCase(lastTweet.user.name),
              lastTweet.full_text,
              lastTweet.id_str
            );
            sendMessage(message);
            savedTweet = lastTweet.full_text;
          }
        } else if (error) {
          console.log(error);
        }
      }
    );

    await delay(5000);
  }
}

function sendMessage(text) {
  subscribedChatIds.forEach((chatId) => {
    slimbot.sendMessage(chatId, text);
  });
}

function createMessage(tweetOwner, tweetText, tweetId) {
  return (
    tweetOwner +
    "\n\n" +
    tweetText +
    "\n\nTweet Source: https://twitter.com/twitter/statuses/" +
    tweetId
  );
}

function titleCase(str) {
  var splitStr = str.toLowerCase().split(" ");
  for (var i = 0; i < splitStr.length; i++) {
    // You do not need to check if i is larger than splitStr length, as your for does that for you
    // Assign it back to the array
    splitStr[i] =
      splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
  }
  // Directly return the joined string
  return splitStr.join(" ");
}

function main() {
  console.log("Listening Updates For Crypto News...");
  slimbot.startPolling();
  getLastTweet();
}

main();
