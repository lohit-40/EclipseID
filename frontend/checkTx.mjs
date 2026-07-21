const query = {
  operationName: 'Transactions',
  variables: { txId: 'e393211b678bfb93706801a695e182cf49f03634ff85455608e95e20102e75c9' },
  query: 'query Transactions($txId: String!) { transactions(txId: $txId) { transactionResult { __typename ... on TransactionSucceedEntirely { block { hash } } ... on TransactionFailed { error } } } }'
};

Promise.all([
  fetch('https://indexer.preprod.midnight.network/api/v4/graphql', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(query) }).then(r => r.json()).then(r => console.log('v4:', JSON.stringify(r))),
  fetch('https://indexer.preprod.midnight.network/api/v1/graphql', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(query) }).then(r => r.json()).then(r => console.log('v1:', JSON.stringify(r))).catch(e => console.log('v1 error'))
]).catch(console.error);
