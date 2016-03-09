'use strict';

var url = require('url');


var Default = require('./DefaultService');


module.exports.hit = function hit (req, res, next) {
  Default.hit(req.swagger.params, res, next);
};

module.exports.serviceHit = function serviceHit (req, res, next) {
  Default.serviceHit(req.swagger.params, res, next);
};
