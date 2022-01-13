/**
 * Creates message for signing into backend
 *
 * @param guildUrlName: urlName of guild on agora space
 * @param timeStamp: Time stamp message was created
 *
 * TODO: This is common among all 3 packages and can get out of sync, change that
 */
export const createMessage = (guildUrlName: string, timeStamp: number) =>
  `Sign into ${guildUrlName} at ${timeStamp}`
