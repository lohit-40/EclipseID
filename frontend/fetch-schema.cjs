const fetch = require('node-fetch');
fetch('https://indexer.preprod.midnight.network/graphql', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    query: `
      query {
        __type(name: "TransactionOffset") {
          name
          inputFields {
            name
            type { name kind }
          }
        }
      }
    `
  })
}).then(r => r.json()).then(j => console.log(JSON.stringify(j, null, 2)));
