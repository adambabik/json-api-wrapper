JSON Api Wrapper
================

Wraps a native JavaScript object or array into a data structure compliant with [JSON API format](http://jsonapi.org/).

## Example

Assume that you retrieved the following data:

```javascript
var book1 = {
    id: 1, title: 
    'The First Entry',
    author: { id: 'j237h9', name: 'Great Artist' }
};
var book2 = {
    id: 2, 
    title: 'The Second Entry',
    author: { id: 'n823h2', name: 'Poor Artist' }
};
```

If you want them to be JSON API compliant, you need to rearrange them:

```javascript
var api = new JSONApi('https://example.com/api/v1/', { verbose: false, urlTemplates: false });
var authors = new Wrapper('authors', api);
var posts = new Wrapper('posts', api);
posts.reference({ ref: 'author', res: authors });

var data = posts.pack([book1, book2]);
```

The `data` variable is an object, but it is JSON API compliant and can be stringified using `JSON.stringify()` method.

```javascript
data = {
    posts: [{
        id: 1, 
        title: 'The First Entry',
        links: {
            author: 'j237h9'
        }
    }, {
        id: 2, 
        title: 'The Second Entry',
        links: {
            author: 'n823h2'
        }
    }],
    linked: {
        authors: [
            { id: 'j237h9', name: 'Great Artist' },
            { id: 'n823h2', name: 'Poor Artist' }
        ]
    }]

## License

MIT
