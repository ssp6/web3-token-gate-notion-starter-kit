import jwt from 'jsonwebtoken'
import { jwtSecret } from './config'
import { JwtDataPayload, JwtDataPayloadDecoded } from './types'

/**
 * Ensures that a JWT has been signed with the env secret, that it can be
 * deciphered and also that it has the correct content
 *
 * @param jwtString
 */
export const verifyJwtPayload = (jwtString: string): JwtDataPayload => {
  try {
    const jwtPayload = jwt.verify(jwtString, jwtSecret) as JwtDataPayloadDecoded
    const { address } = jwtPayload
    if (!address) {
      throw new Error(`payload must contain all keys - { address: ${address} }`)
    }
    return { address }
  } catch (e) {
    throw new Error(`Unable to verify jwt: ${e.message}`)
  }
}
