const url = 'https://indexer.preprod.midnight.network/api/v4/graphql';
const query = {
  query: `
    query IntrospectionQuery {
      __schema {
        types {
          name
          fields {
            name
            type { name kind ofType { name kind } }
          }
        }
      }
    }
  `
};
fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(query)
})
.then(res => res.json())
.then(data => {
  const types = data.data.__schema.types;
  const t1 = types.find(t => t.name === 'UnshieldedOutput');
  const t2 = types.find(t => t.name === 'Address');
  console.log('UnshieldedOutput:', t1 ? t1.fields : 'none');
  console.log('Address:', t2 ? t2.fields : 'none');
});
