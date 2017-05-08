'use strict';
/*eslint no-process-env:0*/

import fs from 'fs'
var atlasCredentials = JSON.parse(fs.readFileSync('../apis.key.json', 'utf8'))['atlasCredentials']

// Production specific configuration
// =================================
module.exports = {
  // Server IP
  ip: process.env.OPENSHIFT_NODEJS_IP
    || process.env.ip
    || undefined,

  // Server port
  port: process.env.OPENSHIFT_NODEJS_PORT
    || process.env.PORT
    || 8080,

  // MongoDB connection options
  mongo: {
    uri: process.env.MONGODB_URI
      || process.env.MONGOHQ_URL
      || process.env.OPENSHIFT_MONGODB_DB_URL + process.env.OPENSHIFT_APP_NAME
      || 'mongodb://' + atlasCredentials + '@bitmeet-shard-00-00-z90zh.mongodb.net:27017,bitmeet-shard-00-01-z90zh.mongodb.net:27017,bitmeet-shard-00-02-z90zh.mongodb.net:27017/bitmeetapi?ssl=true&replicaSet=Bitmeet-shard-0&authSource=admin'
  }
};
