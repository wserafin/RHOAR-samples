'use strict';

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const openshiftConfigLoader = require('openshift-config-loader');
const openshiftRestClient = require('openshift-rest-client');
const jsyaml = require('js-yaml');

const app = express();

// Health Check Middleware
const probe = require('kube-probe');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

let configMap;
let message = "Default hard-coded greeting: Hello, %s!";

app.use('/api/greeting', (request, response) => {
  const name = (request.query && request.query.name) ? request.query.name : 'World';
  return response.send({content: message.replace(/%s/g, name)});
});

// set health check
probe(app);

setInterval(() => {
  retrieveConfigMap().then((config) => {
    if (!config) {
      message = null;
      return;
    }

    if (JSON.stringify(config) !== JSON.stringify(configMap)) {
      configMap = config;
      message = config.message;
    }
  }).catch((err) => {

  });
}, 2000);



// Find the Config Map
function retrieveConfigMap () {
  return openshiftConfigLoader().then((config) => {
    const settings = {
      request: {
        strictSSL: false
      }
    };

    return openshiftRestClient(config, settings).then((client) => {
      const configMapName = 'app-config';
      return client.configmaps.find(configMapName).then((configMap) => {
        const configMapParsed = jsyaml.safeLoad(configMap.data['app-config.yml']);
        return configMapParsed;
      });
    });
  });
}



module.exports = app;
