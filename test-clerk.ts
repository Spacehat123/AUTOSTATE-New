import { clerkClient } from '@clerk/backend'

async function test() {
  const secretKey = process.env.CLERK_SECRET_KEY
  if (!secretKey) throw new Error('No CLERK_SECRET_KEY')
  
  const client = clerkClient({ secretKey })
  
  try {
    const list = await client.invitations.getInvitationList({ query: 'test@example.com' } as any)
    console.log(list)
  } catch (e) {
    console.error('Error with query:', e)
  }

  try {
    const list2 = await client.invitations.getInvitationList({ emailAddress: 'test@example.com' } as any)
    console.log(list2)
  } catch (e) {
    console.error('Error with emailAddress:', e)
  }
}

test()
