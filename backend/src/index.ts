import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()

// Enable CORS for all routes
app.use('*', cors())

// Basic health check endpoint
app.get('/health', (c) => {
  return c.json({ status: 'ok', message: 'Cloudflare Backend is awake and healthy' })
})

// Placeholder for EclipseID issuer logic
app.post('/api/issuer/request-credential', async (c) => {
  const body = await c.req.json()
  const { email, address } = body
  
  // In a real app, you would verify the email, and then return an authorization signature
  // or insert the address into the Midnight smart contract as an authorized user.
  return c.json({ 
    success: true, 
    message: 'Credential requested successfully. Ready for smart contract interaction.',
    received: { email, address }
  })
})

export default app
