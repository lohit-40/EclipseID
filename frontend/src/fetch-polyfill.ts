const originalFetch = window.fetch;

function showOnScreen(msg: string) {
  const div = document.createElement('div');
  div.style.position = 'fixed';
  div.style.bottom = '10px';
  div.style.left = '10px';
  div.style.zIndex = '9999';
  div.style.background = 'rgba(0,0,0,0.8)';
  div.style.color = 'white';
  div.style.padding = '10px';
  div.style.fontFamily = 'monospace';
  div.style.fontSize = '12px';
  div.style.maxWidth = '80vw';
  div.style.whiteSpace = 'pre-wrap';
  div.innerText = msg;
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 10000);
}

window.fetch = async (input, init) => {
  if (typeof input === 'string' && input.includes('/graphql') && init?.body) {
    try {
      const body = JSON.parse(init.body as string);
      
      let offsetIsEmpty = false;
      if (body.variables && body.variables.offset !== undefined) {
        if (body.variables.offset === null || Object.keys(body.variables.offset).length === 0) {
          offsetIsEmpty = true;
          delete body.variables.offset;
        }
      }

      if (offsetIsEmpty && typeof body.query === 'string') {
        body.query = body.query.replace(/,\s*\$offset:\s*[A-Za-z0-9_!]+/g, '');
        body.query = body.query.replace(/\(\$offset:\s*[A-Za-z0-9_!]+\)/g, '');
        body.query = body.query.replace(/,\s*offset:\s*\$offset/g, '');
        body.query = body.query.replace(/\(offset:\s*\$offset\)/g, '');
      }
      
      init.body = JSON.stringify(body);
      
      const response = await originalFetch(input, init);
      const clonedResponse = response.clone();
      clonedResponse.json().then(data => {
        if (data.errors) {
          showOnScreen(`GraphQL Error for ${body.operationName}:\nVariables: ${JSON.stringify(body.variables)}\nError: ${JSON.stringify(data.errors)}`);
          console.error('--- GraphQL Error ---', JSON.stringify(data.errors));
        }
      }).catch(e => {});
      return response;
    } catch (e) {
      console.error('Fetch intercept error:', e);
    }
  }
  return originalFetch(input, init);
};
