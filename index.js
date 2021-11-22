'use strict';
const axios = require('axios');
 
const functions = require('firebase-functions');
const {WebhookClient} = require('dialogflow-fulfillment');
const {Card, Suggestion} = require('dialogflow-fulfillment');
 
process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements
 
exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
 
  function welcome(agent) {
    agent.add(`Welcome to my agent!`);
  }
 
  function fallback(agent) {
    agent.add(`I didn't understand`);
    agent.add(`I'm sorry, can you try again?`);
  }
  
  function rhymingWordHandler(agent){
    const echoText = agent.parameters.echoText;
    agent.add(`Starting your conversation with ${echoText}`);
    return axios.get(`https://api.openai.com/v1/engines/davinci/completions`,{
    prompt: ${EchoText},
    max_tokens: 200,
    temperature: 1,
    top_p: 1,
    n: 1,
    stream: false,
    logprobs: null,
    stop: "\n"
  } {
  headers: {
    'Authorization': `Bearer ${sk-1mUCXLtt488C9LuOfEjTVlDQ88Ib9tEkPb6ppTSI}`
  }
})
    .then((result) => {
        result.data.map(wordObj => {
        	agent.add(wordObj.word);
        });
    });
  }
  
  function loopingHandler(agent){
    return axios.get(`https://ws.smn.gob.ar/alerts/type/AL`)
    .then((result) => {
        result.data.map(wordobj => {
            let zones = "";
            const zone_length = Object.keys(wordobj.zones).length;
            for(var i = 0; i < zone_length; i++){
              zones += `${wordobj.zones[i]} - `;
            }
        	agent.add(`\n*Titulo:* `+ wordobj.title + `\n *Fecha:* ` + wordobj.date + `\n *Hora:* ` + wordobj.hour+ `\n *Estado:* ` + wordobj.status + `\n *Descripción:* ` + wordobj.description +` \n *zonas:* `+ zones +`-->`);
        });
    });
  }

  // Run the proper function handler based on the matched Dialogflow intent name
  let intentMap = new Map();
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  intentMap.set('RhymingWord', rhymingWordHandler);
  intentMap.set('looping test', loopingHandler);
  agent.handleRequest(intentMap);
});
