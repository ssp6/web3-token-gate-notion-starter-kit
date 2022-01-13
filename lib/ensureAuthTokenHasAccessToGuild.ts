import { guildUrlName } from './config'
import { fetchUserHasAccessToGuild } from './fetchUserHasAccessToGuild'
import { verifyJwtPayload } from './verifyJwtPayload'

/**
 * Function that checks if the user address obtained
 * from a jwt auth token has access to the guild associated
 * with this app.
 *
 * Throw error if not, returns address if it does
 */
export const ensureAuthTokenHasAccessToGuild = async (
  authToken: string
): Promise<string> => {
  const decodedJwt = verifyJwtPayload(authToken)
  const { address } = decodedJwt
  const hasAccess = await fetchUserHasAccessToGuild(address, guildUrlName)
  if (!hasAccess) {
    throw new Error(
      `Address ${address} does not have access to guild ${guildUrlName}`
    )
  }

  return address
}
