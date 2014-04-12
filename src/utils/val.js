'use strict';

function Val(val, toArray) {
  this._val = toArray ? arrify(val) : val;
}

module.exports = Val;

var val = Val.prototype;

val.forEach = function (f, ctx) {
  if (Array.isArray(this._val)) {
    return this._val.forEach(f, ctx);
  } else {
    return f.bind(ctx)(this._val, 0, null);
  }
};

val.map = function (f, ctx) {
  if (Array.isArray(this._val)) {
    return this._val.map(f, ctx);
  } else {
    return f.bind(ctx)(this._val, 0, null);
  }
};
