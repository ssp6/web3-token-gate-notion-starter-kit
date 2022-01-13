import { guildUrlName } from './config'

/**
 * Returns boolean if the project is set up to have
 * token gating turned off
 */
export const tokenGatingTurnedOff = () => !guildUrlName
