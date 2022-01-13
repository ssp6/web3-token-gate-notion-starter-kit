import { GetServerSideProps } from 'next'
import React from 'react'
import { domain } from 'lib/config'
import { resolveNotionPage } from 'lib/resolve-notion-page'
import { NotionPage } from 'components'
import { ensureAuthTokenHasAccessToGuild } from '../lib/ensureAuthTokenHasAccessToGuild'
import { redirectSignIn } from '../lib/redirectSignIn'
import { tokenGatingTurnedOff } from '../lib/tokenGatingTurnedOff'

export const getServerSideProps: GetServerSideProps = async (context) => {
  const rawPageId = context.params.pageId as string
  if (rawPageId === 'sitemap.xml' || rawPageId === 'robots.txt') {
    return {
      redirect: {
        permanent: false,
        destination: `/api/${rawPageId}`
      }
    }
  }

  if (!tokenGatingTurnedOff()) {
    const authToken = context.req?.cookies?.authToken
    const host = context.req.headers.host
    if (!authToken || !host) {
      return redirectSignIn()
    }

    try {
      await ensureAuthTokenHasAccessToGuild(authToken)
    } catch (e) {
      return redirectSignIn()
    }
  }

  try {
    const props = await resolveNotionPage(domain, rawPageId)

    return { props }
  } catch (err) {
    console.error('page error', domain, rawPageId, err)

    // we don't want to publish the error version of this page, so
    // let next.js know explicitly that incremental SSG failed
    throw err
  }
}

export default function NotionDomainDynamicPage(props) {
  return <NotionPage {...props} />
}
