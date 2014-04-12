'use strict';

var extend = require('lodash-node/modern/objects/assign');
var clone = require('lodash-node/modern/objects/clone');
var assert = require('assert');

/**
 * Default settings.
 * @type {Object}
 */

var defaults = {
  urlTemplates: false,
  verbose: false,
  baseUrl: '/'
};

/**
 * `JSONApi` constructor.
 *
 * @param {String} baseUrl
 * @param {Object|Null} options
 * @public
 */

function JSONApi(baseUrl, options) {
  if (!(this instanceof JSONApi)) {
    return new JSONApi(baseUrl, options);
  }

  if (baseUrl && typeof baseUrl === 'object') {
    options = baseUrl;
  } else {
    options || (options = {});
    options.baseUrl = baseUrl;
  }

  this.options = extend(clone(defaults), options);
}

/**
 * Export `JSONApi` constructor.
 */

module.exports = JSONApi;

/**
 * Prototype.
 *
 * @type {Object}
 */

var jsonapi = JSONApi.prototype;

/**
 * Create default property definitions. Just for conveniance,
 * all options are available in `options` instance property.
 */

Object.keys(defaults).forEach(function (key) {
  Object.defineProperty(jsonapi, key, {
    get: function () { return this.options[key]; }
  });
});
