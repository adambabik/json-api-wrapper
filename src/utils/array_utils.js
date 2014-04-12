'use strict';

var util = module.exports;

util.arrify = function (item) {
  return Array.isArray(item) ? item : [item];
};

util.unarrify = function (arr) {
  return Array.isArray(arr) ? arr[0] : arr;
};
