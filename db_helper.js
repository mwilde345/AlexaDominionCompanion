'use strict';
module.change_code = 1;
var _ = require('lodash');
var domComp_DATA_TABLE_NAME = 'domCompData';
var dynasty = require('dynasty')({});
/*
var localUrl = 'http://localhost:4000';
var localCredentials = {
  region: 'us-east-1',
  accessKeyId: 'fake',
  secretAccessKey: 'fake'
};
var localDynasty = require('dynasty')(localCredentials, localUrl);
var dynasty = localDynasty;
*/

function DominionCompanion() {}
var domCompTable = function() {
  return dynasty.table(domComp_DATA_TABLE_NAME);
};

DominionCompanion.prototype.createdomCompTable = function() {
  return dynasty.describe(domComp_DATA_TABLE_NAME)
    .catch(function(error) {
      return dynasty.create(domComp_DATA_TABLE_NAME, {
        key_schema: {
          hash: ['userId',
            'string'
          ]
        }
      });
    });
};

DominionCompanion.prototype.storedomCompData = function(userId, domCompData) {
  return domCompTable().insert({
    userId: userId,
    data: domCompData
  }).catch(function(error) {
    console.log(error);
  });
};

DominionCompanion.prototype.readdomCompData = function(userId) {
  return domCompTable().find(userId)
    .then(function(result) {
      return result;
    })
    .catch(function(error) {
      console.log(error);
    });
};

module.exports = DominionCompanion;