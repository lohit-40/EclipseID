const url = 'https://indexer.preprod.midnight.network/api/v4/graphql';
const query = {
  query: `
    query IntrospectionQuery {
      __schema {
        types {
          name
          fields {
            name
            type {
              name
              kind
            }
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
  if (data.errors) { console.error(data.errors); return; }
  const types = data.data.__schema.types;
  const blockType = types.find(t => t.name === 'Block');
  const txType = types.find(t => t.name === 'Transaction');
  console.log('Block fields:', blockType ? blockType.fields.map(f => f.name) : 'none');
  console.log('Transaction fields:', txType ? txType.fields.map(f => f.name) : 'none');
});
