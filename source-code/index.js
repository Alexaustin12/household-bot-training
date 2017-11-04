/**
A simple skill that helps users manage and learn about your household
For questions, reach out to Alex Blake Austin
 **/

'use strict';

var aws = require('aws-sdk'); //enables additional functions that we won't use in this tutorial
var CARD_TITLE = "Scenic Helper"; // The title that will show on the Alexa App

// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
exports.handler = function (event, context) {
    try {
        console.log("event.session.application.applicationId=" + event.session.application.applicationId);

        /**
         * Uncomment this if statement and populate with your skill's application ID to
         * prevent someone else from configuring a skill that sends requests to this function.
         */
    //const APP_ID = 'amzn1.ask.skill.dcef1264-8ce3-4f6b-8c34-598b57e55309';  // Replace with your Alexa skill's app ID. Security measure so that only your skill can call this functional.
    // if (event.session.application.applicationId !== APP_ID) {
    //     context.fail("Invalid Application ID");
    //  }

        if (event.session.new) {
            onSessionStarted({requestId: event.request.requestId}, event.session);
        }

        if (event.request.type === "LaunchRequest") {
            onLaunch(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "IntentRequest") {
            onIntent(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "SessionEndedRequest") {
            onSessionEnded(event.request, event.session);
            context.succeed();
        }
    } catch (e) {
        context.fail("Exception: " + e);
    }
};

/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
    console.log("onSessionStarted requestId=" + sessionStartedRequest.requestId
        + ", sessionId=" + session.sessionId);

    // add any session init logic here
}

/**
 * Called when the user invokes the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
    console.log("onLaunch requestId=" + launchRequest.requestId
        + ", sessionId=" + session.sessionId);

    getWelcomeResponse(callback);
}


/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(intentRequest, session, callback) {
    console.log("onIntent requestId=" + intentRequest.requestId
        + ", sessionId=" + session.sessionId); //send the session ID to the log (does not impact user experience, could be useful for debugging)

    var intent = intentRequest.intent, 
        intentName = intentRequest.intent.name; //we've now taken in a JSON object (intentRequest) and we're grabing the value "intent.name" and storing it for use below
    
    //Based on the intentName, we're defining what we want the skill to do
    if ("whoLivesHereIntent" === intentName) {
        handlewhoLivesHereRequest(intent, session, callback);
    } else if ("takeOutTrashIntent" === intentName) {
        handletakeOutTrashRequest(intent, session, callback); 
    } else if ("cohortIntent" === intentName) {
        handlecohortRequest(intent, session, callback); 
    } else if ("AMAZON.HelpIntent" === intentName) {
        handleGetHelpRequest(intent, session, callback);
    } else if ("AMAZON.StopIntent" === intentName) {
        handleFinishSessionRequest(intent, session, callback);
    } else if ("AMAZON.CancelIntent" === intentName) {
        handleFinishSessionRequest(intent, session, callback);
    } else if ("AMAZON.StartOverIntent" === intentName) {
        getWelcomeResponse(callback);
    } else if ("AMAZON.RepeatIntent" === intentName) {
        handleRepeatRequest(intent, session, callback);
    } else {
        handleInvalidRequest(intent, session, callback) 
        throw "Invalid intent";
    }
}

//--------------logic to handle each intent------------
function handlewhoLivesHereRequest(intent, session, callback){
    var sessionAttributes = {},
    speechOutput = "Greg, Steve, Neeraj, Christian, and Alex. Good luck getting any work done at the house.", //the speech response you want Alexa to say
    repromptText = "Are you still there? Try asking me who should take out the trash", //additional text you want Alexa to say if the user doesnt respond for 5 seconds
    shouldEndSession = true; //true if you want Alexa to end the session and close your skill, false if you want her to keep listening for another question
  
    callback(sessionAttributes,
        buildSpeechletResponse(CARD_TITLE, speechOutput, repromptText, shouldEndSession));
}

function handletakeOutTrashRequest(intent, session, callback){
    var sessionAttributes = {};
    var roommates = [
        'Greg',
        'Steve',
        'Christian',
        'Neeraj',
        'Alex'
        ],
    rand = Math.floor(Math.random() * roommates.length), //generate a random number between 1 and the "length" of the roommates array aka the number of items in the array called roommates (defined above). We also round the result down, since arrays actually start numbering at 0 instead of 1, but you don't need to know this detail.
    speechOutput = "I think " + roommates[rand] + " should take out the trash.", //now we grab the name from the slot at number rand. e.g. if rand was 3, we'd grab the 3rd name
    repromptText = "Are you still there? Try asking me who lives here", 
    shouldEndSession = true; 
  
    callback(sessionAttributes,
        buildSpeechletResponse(CARD_TITLE, speechOutput, repromptText, shouldEndSession));
}

function handlecohortRequest(intent, session, callback){
    var sessionAttributes = {},
    cohortName = intent.slots.cohortName.value,
    speechOutput;
    
    if (cohortName == 'gold') {speechOutput = "Alex is in Gold. Go Gold!"}
    else if (cohortName == 'blue') {speechOutput = "Christian is in Blue. Who let the bears out?"}
    else if (cohortName == 'axe' || 'ax') {speechOutput = "Greg is in Axe. Fax. Slacks. Axe."}
    else if (cohortName == 'oski') {speechOutput = "Steve and Neeraj are in Oski. Oski. Oski. Oski."}
    else speechOutput = "I don't recognize that cohort. Do you even go here?";
    
    var repromptText = "Are you still there? Try asking me who should take out the trash", 
    shouldEndSession = true; 
  
    callback(sessionAttributes,
        buildSpeechletResponse(CARD_TITLE, speechOutput, repromptText, shouldEndSession));
}




//------------logic for required/default Amazon functions-----------

function handleInvalidRequest(intent, session, callback) {
    var sessionAttributes = {},
        speechOutput = "Sorry, I don't follow. Try saying: Who lives here?",
        repromptText = "Try saying: Who lives here?";
        var shouldEndSession = false;
    callback(sessionAttributes,
        buildSpeechletResponse(CARD_TITLE, speechOutput, repromptText, shouldEndSession));
}

function getWelcomeResponse(callback) {
    var sessionAttributes = {},
        speechOutput = "Hi, you can ask me who should do the chores. Try saying: Who should take out the trash?";
        var shouldEndSession = false;
        var repromptText = "Try saying: Who should take out the trash?";
    sessionAttributes = {
        "speechOutput": speechOutput,   //I think this is just recording what Alexa said for use later
        "repromptText": repromptText,   
    };
    callback(sessionAttributes,
        buildSpeechletResponse(CARD_TITLE, speechOutput, repromptText, shouldEndSession));
}

function handleRepeatRequest(intent, session, callback) {
    // Repeat the previous speechOutput and repromptText from the session attributes if available
    // else start a new session
    if (!session.attributes || !session.attributes.speechOutput) {
        getWelcomeResponse(callback);
    } else {
        callback(session.attributes,
            buildSpeechletResponseWithoutCard(session.attributes.speechOutput, session.attributes.repromptText, false));
    }
}

function handleGetHelpRequest(intent, session, callback) {
    // Provide a help prompt for the user, explaining how the skill works. Then, continue the skill
    // if there is one in progress, or provide the option to start another one.
    
    // Ensure that session.attributes has been initialized
    if (!session.attributes) {
        session.attributes = {};
    }

    // Set a flag to track that we're in the Help state.
    session.attributes.userPromptedToContinue = true;

    // Do not edit the help dialogue. This has been created by the Alexa team to demonstrate best practices.
    var speechOutput = "You can ask me to name who lives in the house";
    var repromptText = "You can also try saying: Who is in the blue cohort?";
    var shouldEndSession = false;
    callback(session.attributes,
        buildSpeechletResponseWithoutCard(speechOutput, repromptText, shouldEndSession));
}
function handleFinishSessionRequest(intent, session, callback) {
    // End the session with a "Good bye!" if the user wants to quit the game
    callback(session.attributes,
        buildSpeechletResponseWithoutCard("Good bye!", "", true));
}


//-----------helper functions  ----------------
function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        card: {
            type: "Simple",
            title: title,
            content: output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildSpeechletResponseWithDetail(title, detail, output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        card: {
            type: "Simple",
            title: title,
            content: detail
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildSpeechletResponsewithImage(title, detail, smallImageURL, largeImageURL, output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        card: {
          type: "Standard",
          title: title,
          text: detail,
          image: {
            smallImageUrl: smallImageURL,
            largeImageUrl: largeImageURL
          }
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildSpeechletResponseWithoutCard(output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: "1.0",
        sessionAttributes: sessionAttributes,
        response: speechletResponse
    };
}
