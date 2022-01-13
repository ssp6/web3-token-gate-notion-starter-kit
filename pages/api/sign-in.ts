import { ethers } from 'ethers'
import { NextApiRequest, NextApiResponse } from 'next'
import { guildUrlName } from '../../lib/config'
import { createMessage } from '../../lib/createMessage'
import { fetchUserHasAccessToGuild } from '../../lib/fetchUserHasAccessToGuild'
import { signJwt } from '../../lib/signJwt'
import { timestampNowPlusMinutes } from '../../lib/timestampNowPlusMinutes'
import { tokenGatingTurnedOff } from '../../lib/tokenGatingTurnedOff'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  console.debug('sign-in received event:', req)
  if (tokenGatingTurnedOff()) {
    return res.status(404).json({ error: '/api/sign-in end point not available whilst token gating is turned off'})
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: `${req.method} method not allowed` })
  }

  const { signature, address, timeStamp } = req.body || {}
  if (!signature || !address || !timeStamp) {
    return res.status(400).json({
      error: `All arguments required. Received: { signature: ${signature}, address: ${address}, timeStamp: ${timeStamp} }`
    })
  }

  const recoveredAddressFromMessage = ethers.utils.verifyMessage(
    createMessage(guildUrlName, timeStamp),
    signature
  )
  if (recoveredAddressFromMessage.toLowerCase() !== address.toLowerCase()) {
    return res.status(400).send({
      error:
        'Address recovered form message/signature does not match address given'
    })
  }

  try {
    const hasAccess = await fetchUserHasAccessToGuild(address, guildUrlName)
    if (!hasAccess) {
      return res.status(403).send({
        message: `Address ${address} does not have access to guild ${guildUrlName}`
      })
    }

    const authToken = signJwt({ address })
    return (
      res
        .status(200)
        // TODO: Add Secure;
        .setHeader(
          'Set-Cookie',
          `authToken=${authToken}; HttpOnly; Expires=${timestampNowPlusMinutes(
            30
          )}; Path=/`
        )
        .send({ message: 'Successfully signed in' })
    )
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}
