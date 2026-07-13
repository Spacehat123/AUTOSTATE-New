import { Inngest } from 'inngest'

/**
 * Shared Inngest client — import this wherever you need to send events.
 * We initialise it once here so every route shares the same client config.
 */
export const inngest = new Inngest({
  id: 'autostate',
  name: 'Autostate'
})
