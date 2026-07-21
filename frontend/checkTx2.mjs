const query = {
  operationName: 'Transactions',
  variables: { txId: 'e393211b678bfb93706801a695e182cf49f03634ff85455608e95e20102e75c9' },
  query: 'query Transactions($txId: String!) { transactions(txId: $txId) { transactionResult { __typename ... on TransactionSucceedEntirely { block { hash } } ... on TransactionFailed { error } } } }'
};

const query2 = {
  operationName: 'Transactions',
  variables: { txId: 'e393211b678bfb93706801a695e182cf49f03634ff85455608e95e20102e75c9', offset: 0 },
  query: 'query Transactions($txId: String!, $offset: Int!) { transactions(txId: $txId, offset: $offset) { __typename } }'
};

Promise.all([
  fetch('https://indexer.preprod.midnight.network/graphql', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(query) }).then(r => r.json()).then(r => console.log('v-root 1:', JSON.stringify(r))),
  fetch('https://indexer.preprod.midnight.network/graphql', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(query2) }).then(r => r.json()).then(r => console.log('v-root 2:', JSON.stringify(r)))
]).catch(console.error);
