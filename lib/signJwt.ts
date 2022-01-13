import jwt from 'jsonwebtoken'
import { jwtSecret } from './config'
import { JwtDataPayload } from './types'

export const signJwt = (data: JwtDataPayload) =>
  jwt.sign(data, jwtSecret, {
    expiresIn: '30m'
  })
