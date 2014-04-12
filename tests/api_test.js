'use strict';

var JSONApi = require('../src/api');
var expect = require('chai').expect;

describe('#JSONApi', function () {
  it('should initialize', function () {
    var api = new JSONApi('/test', { verbose: true, urlTemplates: true });
    expect(api.options).to.have.property('baseUrl', '/test');
    expect(api.options).to.have.property('verbose', true);
    expect(api.options).to.have.property('urlTemplates', true);
  });
});
