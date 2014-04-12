'use strict';

var JSONApi = require('../src/api');
var Wrapper = require('../src/wrapper');
var chai = require('chai');
var assert = chai.assert;

describe('#Wrapper', function () {
  describe('verbose = false', function () {
    var api, posts, authors, comments;

    before(function () {
      api = new JSONApi('/', { verbose: false, urlTemplates: false });
      authors = new Wrapper('authors', api);
      comments = new Wrapper('comments', api);
      posts = new Wrapper('posts', api);
      posts.reference({ ref: 'author', res: authors });
      posts.reference([{ ref: 'comments', res: comments }]);
    });

    it('should initialize', function () {
      assert.equal(posts.api, api);
      assert.equal(posts.type, 'posts');
      assert.lengthOf(posts.refs, 2);
    });

    it('should pack simple objects', function () {
      var data = { id: 1, title: 'The First Entry' };
      assert.deepEqual(posts.pack(data), { posts: [data] });
      assert.deepEqual(posts.pack([data, data]), { posts: [data, data] });
    });

    it('should pack data with to-one relationship', function () {
      var data1 = {
        id: 1, title: 'The First Entry',
        author: { id: 'j237h9', name: 'Great Artist' }
      };
      var data2 = {
        id: 2, title: 'The Second Entry',
        author: { id: 'n823h2', name: 'Poor Artist' }
      };

      assert.deepEqual(posts.pack(data1), {
        posts: [{
          id: 1,
          title: 'The First Entry',
          links: {
            author: 'j237h9'
          }
        }],
        linked: {
          authors: [{
            id: 'j237h9',
            name: 'Great Artist'
          }]
        }
      });

      assert.deepEqual(posts.pack([data1, data2]), {
        posts: [{
          id: 1, title: 'The First Entry',
          links: {
            author: 'j237h9'
          }
        }, {
          id: 2, title: 'The Second Entry',
          links: {
            author: 'n823h2'
          }
        }],
        linked: {
          authors: [
            { id: 'j237h9', name: 'Great Artist' },
            { id: 'n823h2', name: 'Poor Artist' }
          ]
        }
      });
    });

    it('should pack data with to-many relationships', function () {
      var data = {
        id: 1,
        title: 'The First Entry',
        author: { id: 'j87n8y', name: 'Great Artist' },
        comments: [
          { id: 1, text: 'The first comment' },
          { id: 2, text: 'bad comment' }
        ]
      };

      assert.deepEqual(posts.pack(data), {
        posts: [{
          id: data.id,
          title: data.title,
          links: {
            author: data.author.id,
            comments: [1, 2]
          }
        }],
        linked: {
          authors: [data.author],
          comments: data.comments
        }
      });
    });
  });

  describe('verbose = true', function () {
    var api, posts, comments;

    before(function () {
      api = new JSONApi('/', { verbose: true, urlTemplates: false });
      comments = new Wrapper('comments', api);
      posts = new Wrapper('posts', api);
      posts.reference([{ ref: 'comments', res: comments }]);
    });

    it('should pack data', function () {
      var data = {
        id: 1,
        title: 'The First Entry',
        comments: [
          { id: 1, text: 'The first comment' },
          { id: 2, text: 'bad comment' }
        ]
      };

      assert.deepEqual(posts.pack(data), {
        posts: [{
          id: data.id,
          title: data.title,
          links: {
            comments: [{
              id: 1,
              type: 'comments',
              href: '/comments/1'
            }, {
              id: 2,
              type: 'comments',
              href: '/comments/2'
            }]
          }
        }],
        linked: {
          comments: data.comments
        }
      });
    });
  });

  describe('urlTemplates = true', function () {
    var api, posts, comments;

    before(function () {
      api = new JSONApi('/', { verbose: false, urlTemplates: true });
      comments = new Wrapper('comments', api);
      posts = new Wrapper('posts', api);
      posts.reference([{ ref: 'comments', res: comments }]);
    });

    it('should pack data', function () {
      var data = {
        id: 1,
        title: 'The First Entry',
        comments: [
          { id: 1, text: 'The first comment' },
          { id: 2, text: 'bad comment' }
        ]
      };

      assert.deepEqual(posts.pack(data).links, {
        'posts.comments': {
          href: '/comments/{posts.comments}',
          type: 'comments'
        }
      });
    });
  });
});
