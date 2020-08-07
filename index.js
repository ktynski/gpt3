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
    const word = agent.parameters.word;
    agent.add(`Here are the rhyming words for ${word}`);
    return axios.get(`https://api.datamuse.com/words?rel_rhy=${word}`)
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
