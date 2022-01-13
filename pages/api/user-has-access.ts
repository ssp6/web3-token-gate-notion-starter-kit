import { NextApiRequest, NextApiResponse } from 'next'
import { guildUrlName } from '../../lib/config'
import { ensureAuthTokenHasAccessToGuild } from '../../lib/ensureAuthTokenHasAccessToGuild'
import { fetchUserHasAccessToGuild } from '../../lib/fetchUserHasAccessToGuild'
import { signJwt } from '../../lib/signJwt'
import { timestampNowPlusMinutes } from '../../lib/timestampNowPlusMinutes'
import { tokenGatingTurnedOff } from '../../lib/tokenGatingTurnedOff'
import { verifyJwtPayload } from '../../lib/verifyJwtPayload'

/**
 * API end point that checks if an address, handed through cookie, has access to
 * to the correct guild/community
 *
 * @param req
 * @param res
 */
export default async (req: NextApiRequest, res: NextApiResponse) => {
  console.debug('user-has-access received event:', req)
  if (tokenGatingTurnedOff()) {
    return res.status(404).json({ error: '/api/user-has-access end point not available whilst token gating is turned off'})
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: `${req.method} method not allowed` })
  }

  const authToken = req.cookies?.authToken
  if (!authToken) {
    return res.status(401).json({ error: 'No auth token provided' })
  }

  let address
  try {
    address = await ensureAuthTokenHasAccessToGuild(authToken)
  } catch (e) {
    return res.status(403).json({
      error: e.message
    })
  }

  try {
    const authToken = signJwt({ address })
    // TODO: Add Secure;
    return res
      .status(200)
      .setHeader(
        'Set-Cookie',
        `authToken=${authToken}; HttpOnly; Expires=${timestampNowPlusMinutes(
          30
        )}; Path=/`
      )
      .send({ message: 'User has access to guild' })
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}
