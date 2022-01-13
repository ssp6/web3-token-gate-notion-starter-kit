import got from 'got'
import { web3AuthApiBaseUrl } from './config'

/**
 * Partial of the data about a guild
 */
type GuildInfo = {
  id: number
  name: string
  urlName: string
  description: string
}

type GuildRoleStatus = {
  roleId: number
  access: true
}

/**
 * Checks that the user has access to at least one role in
 * the agora.space guild
 *
 * @param userAddress Address of user's wallet
 * @param guildUrlName Id of guild/community as dictated by agora.space
 */
export const fetchUserHasAccessToGuild = async (
  userAddress: string,
  guildUrlName: string
) => {
  try {
    const guildDetailsBody = await got
      .get(`${web3AuthApiBaseUrl}/guild/urlName/${guildUrlName}`)
      .json<GuildInfo>()
    const userGuildAccessBody = await got
      .get<string>(
        `${web3AuthApiBaseUrl}/guild/access/${guildDetailsBody.id}/${userAddress}`
      )
      .json<GuildRoleStatus[]>()
    return userGuildAccessBody.some((guildRoleStatus) => guildRoleStatus.access)
  } catch (e) {
    const errorBody = e?.response?.body ? JSON.parse(e.response.body) : {}
    const error =
      errorBody['errors'].length > 0
        ? errorBody.errors[0]
        : 'Unknown error from guild auth'
    console.log('Error: ', error)
    throw new Error(`Error from guild auth: ${error?.msg}`)
  }
}
