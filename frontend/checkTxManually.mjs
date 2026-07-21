const query = {
  query: '{ transaction(id: "e393211b678bfb93706801a695e182cf49f03634ff85455608e95e20102e75c9") { hash } }'
};
fetch('https://indexer.preprod.midnight.network/api/v4/graphql', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(query)
}).then(r => r.json()).then(r => console.log(JSON.stringify(r))).catch(console.error);
