const query = {
  query: `
    query {
      __type(name: "Query") {
        fields {
          name
          args { name }
        }
      }
    }
  `
};

fetch('https://indexer.preprod.midnight.network/graphql', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(query) }).then(r => r.json()).then(r => console.log('root API:', JSON.stringify(r))).catch(console.error);

const query2 = {
  query: `
    query {
      __type(name: "Query") {
        fields {
          name
          args { name }
        }
      }
    }
  `
};

fetch('https://indexer.preprod.midnight.network/api/v1/graphql', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(query2) }).then(r => r.json()).then(r => console.log('v1 API:', JSON.stringify(r))).catch(console.error);
