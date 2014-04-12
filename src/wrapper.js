'use strict';

var assert = require('assert');
var clone = require('lodash-node/modern/objects/clone');
var JSONApi = require('./api');
var Val = require('./utils/val');
var arrify = require('./utils/array_utils').arrify;
var unarrify = require('./utils/array_utils').unarrify;

/**
 * Convert native JavaScript objects into JSON Api compliant structures.
 *
 * @param {String} type  Resource type
 * @param {JSONApi} api  JSONApi instance
 * @constructor
 * @public
 */

function Wrapper(type, api) {
  if (!(this instanceof Wrapper)) return new Wrapper(type, api);

  assert(typeof type === 'string', '`type` must be a string');
  assert(api instanceof JSONApi, '`api` must be an instanceof JSONApi');

  this.type = type;
  this.api = api;
  this.refs = [];
}

/**
 * Export `Wrapper` constructor.
 */

module.exports = Wrapper;

/**
 * `Wrapper`'s prototype.
 * @type {Object}
 */

var wrapper = Wrapper.prototype;

/**
 * Add a new reference definition.
 * The definition should be an array (then it's to-many)
 * or an object (to-one).
 * A correct definition (`ref` parameter) must have the following properties:
 * - {String} ref   Reference name
 * - {Wrapper} res  Resource definition
 *
 * @param {Array|Object} ref  Reference definition
 * @public
 */

wrapper.reference = function (ref) {
  if (Array.isArray(ref)) {
    ref = unarrify(ref);
    ref.toMany = true;
  }
  this.refs.push(ref);
};

/**
 * Build `link` property for each data item.
 *
 * @param  {Object} links Object to which add a link.
 * @param  {Object} item  Data item.
 * @param  {Object} ref   Reference definition
 * @private
 */

wrapper._buildLinks = function (links, item, ref) {
  var self = this;
  var prop = ref.ref;
  var id = new Val(item[prop]).map(function (i) { return i.id; });

  if (ref.toMany && !Array.isArray(id)) {
    throw new TypeError('to-many relationship received single id');
  }

  if (self.api.verbose) {
    links[prop] = new Val(id).map(function (id) {
      return {
        id: id,
        type: ref.res.type,
        href: self.api.baseUrl + ref.res.type + '/' + id
      };
    });
  } else {
    links[prop] = id;
  }
};

/**
 * Build `linked` property.
 *
 * @param  {Object} linked Object to which add a link.
 * @param  {String} type   Resource name.
 * @param  {Any}    item   Item to add.
 * @private
 */

wrapper._buildLinked = function (linked, type, item) {
  var linkedProp = linked[type] || (linked[type] = []);
  if (Array.isArray(item)) {
    linkedProp.push.apply(linkedProp, item);
  } else {
    linkedProp.push(item);
  }
};

/**
 * Build link templates from added references.
 *
 * @return {Object}
 * @private
 */

wrapper._buildLinkTemplates = function () {
  var self = this;

  if (self.refs.length === 0) {
    return null;
  }

  var links = {};

  this.refs.forEach(function (ref) {
    var key = self.type + '.' + ref.ref;
    links[key] = {
      type: ref.res.type,
      href: self.api.baseUrl + ref.res.type + '/{'+key+'}'
    };
  });

  return links;
};

/**
 * Pack data to a data structure compliant with JSON Api format.
 *
 * @param  {Array|Object} data
 * @return {Object}
 * @public
 */

wrapper.pack = function (data) {
  var self = this;
  var result = [];
  var linked = null;

  data = arrify(clone(data, true));

  data.forEach(function (item) {
    var links = null,
        ref, prop,
        i, len;

    for (i = 0, len = self.refs.length; i < len; i += 1) {
      ref = self.refs[i];
      prop = ref.ref;

      if (!(prop in item)) {
        continue;
      }

      if (ref.toMany && !Array.isArray(item[prop])) {
        throw new TypeError('`' + prop + '` is to-many reference, but data is to-one.');
      }

      // Create `links` object.
      self._buildLinks(links || (links = {}), item, ref);
      // Add to `linked` object.
      self._buildLinked(linked || (linked = {}), ref.res.type, item[prop]);
      // Clean up
      delete item[prop];
    }

    links && (item.links = links);
    result.push(item);
  });

  var ret = {};
  ret[self.type] = result;
  linked && (ret.linked = linked);

  if (self.api.urlTemplates) {
    ret.links = self._buildLinkTemplates();
  }

  return ret;
};
