import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()

app.use('*', cors())

app.get('/health', (c) => {
  return c.json({ status: 'ok', message: 'Cloudflare Backend is awake and healthy' })
})

// Global in-memory storage for the contract address
// (For a production system this would be KV/Durable Objects, but this is perfect for a hackathon demo)
let GLOBAL_CONTRACT_ADDRESS = '';

app.post('/api/admin/set-contract', async (c) => {
  try {
    const { contractAddress } = await c.req.json();
    if (!contractAddress) return c.json({ success: false, error: 'contractAddress is required' }, 400);
    GLOBAL_CONTRACT_ADDRESS = contractAddress;
    return c.json({ success: true, message: 'Contract address globally updated' });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

app.get('/api/contract', (c) => {
  return c.json({ success: true, contractAddress: GLOBAL_CONTRACT_ADDRESS });
});

// Helper to hash string to 32-byte hex string
async function sha256Hex(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// 32-byte static identifier for this Issuer backend
const ISSUER_SECRET = "ECLIPSE_ID_BACKEND_ISSUER_SECRET_KEY_2026";

app.post('/api/issuer/request-credential', async (c) => {
  try {
    const body = await c.req.json();
    const { email, address } = body;
    
    if (!email || !address) {
      return c.json({ success: false, error: 'Email and address are required' }, 400);
    }

    // 1. Generate the Backend's 32-byte Issuer ID
    const issuerId = await sha256Hex(ISSUER_SECRET);

    // 2. Generate the User's unique Nullifier.
    // In a real ZK application, the nullifier is derived from the user's secret identity.
    // For this prototype, we simulate the credential issuance by giving the user a 
    // unique nullifier tied to their email and address.
    const nullifier = await sha256Hex(`${email}:${address}:${ISSUER_SECRET}`);

    return c.json({ 
      success: true, 
      issuerId,
      nullifier,
      message: 'Credential requested successfully. Ready for smart contract interaction.'
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
})

export default app
