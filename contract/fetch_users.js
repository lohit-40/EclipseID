const url = 'https://indexer.preprod.midnight.network/api/v4/graphql';
const query = {
  query: `{ transactions(limit: 500) { submitter } }`
};
fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(query)
})
.then(res => res.json())
.then(data => {
  if (data.errors) { console.error(data.errors); return; }
  const submitters = data.data.transactions.map(t => t.submitter);
  const unique = [...new Set(submitters)].filter(s => s != null);
  console.log(JSON.stringify(unique.slice(0, 50)));
});
