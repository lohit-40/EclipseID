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

const SECRET_ADMIN_KEY = 'eclipse-hackathon-2026-secure-key';

app.post('/api/admin/set-contract', async (c) => {
  try {
    const adminKey = c.req.header('X-Admin-Key');
    if (adminKey !== SECRET_ADMIN_KEY) {
      return c.json({ success: false, error: 'Unauthorized: Invalid Admin API Key' }, 401);
    }

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

app.get('/api/issuer/public-key', async (c) => {
  try {
    const issuerId = await sha256Hex(ISSUER_SECRET);
    return c.json({ success: true, publicKey: issuerId });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

app.post('/api/issuer/issue', async (c) => {
  try {
    const body = await c.req.json();
    const { email } = body;
    
    if (!email) {
      return c.json({ success: false, error: 'Email is required' }, 400);
    }

    // Generate a random 32-byte secret identity (as a decimal string for BigInt)
    // In a real app this would be derived deterministically or stored securely
    const randomBytes = new Uint8Array(32);
    crypto.getRandomValues(randomBytes);
    let secretInt = 0n;
    for (const b of randomBytes) {
      secretInt = (secretInt << 8n) + BigInt(b);
    }
    // Field size in Midnight is roughly 254 bits, we modulo to be safe
    // 2^253
    const FIELD_PRIME = 28948022309329048855892746252171976963317496166410141009864396001978282409984n;
    const secret_identity = (secretInt % FIELD_PRIME).toString();

    return c.json({ 
      success: true, 
      secret_identity,
      message: 'Credential issued successfully.'
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
})

export default app
