import { useGetUserFromProviders } from 'eth-hooks'
import { ethers } from 'ethers'
import ky from 'ky'
import Router from 'next/router'
import { useCallback, useEffect, useState } from 'react'
import * as React from 'react'
import Web3Modal from 'web3modal'
import { TEthersProvider } from 'eth-hooks/models'
import { guildUrlName } from '../lib/config'
import { createMessage } from '../lib/createMessage'
import { tokenGatingTurnedOff } from '../lib/tokenGatingTurnedOff'
import { Page404 } from './Page404'
import { PageHead } from './PageHead'
import styles from './styles.module.css'

const web3Modal = new Web3Modal({
  cacheProvider: true
  // TODO: Add back WalletConnectProvider if required
  // providerOptions: {
  //     walletconnect: {
  //         package: WalletConnectProvider, // required
  //         options: {
  //             infuraId: INFURA_ID,
  //         },
  //     },
  // },
})

const logoutOfWeb3Modal = async () => {
  await web3Modal.clearCachedProvider()
  setTimeout(() => {
    window.location.reload()
  }, 1)
}

window.ethereum &&
  window.ethereum.on('accountsChanged', (accounts: string[]) => {
    web3Modal.cachedProvider &&
      setTimeout(() => {
        window.location.reload()
      }, 1)
  })

export const SignIn: React.FC = () => {
  const [injectedProvider, setInjectedProvider] = useState<TEthersProvider>()
  const [isSigning, setIsSigning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (tokenGatingTurnedOff()) {
      console.error('Re-routing away from /sign-in because token gating turned off')
      Router.replace('/')
    }
  }, [guildUrlName])

  const user = useGetUserFromProviders(injectedProvider)

  const loadWeb3Modal = useCallback(async () => {
    const provider = await web3Modal.connect()
    setInjectedProvider(new ethers.providers.Web3Provider(provider))

    provider.on('chainChanged', (chainId: string) => {
      console.log(`chain changed to ${chainId}! updating providers`)
      setInjectedProvider(new ethers.providers.Web3Provider(provider))
    })

    provider.on('accountsChanged', () => {
      console.log(`account changed!`)
      setInjectedProvider(new ethers.providers.Web3Provider(provider))
    })

    // Subscribe to session disconnection
    provider.on('disconnect', (code: string, reason: string) => {
      console.log(code, reason)
      logoutOfWeb3Modal()
    })
  }, [setInjectedProvider])

  // Ensures stays signed in after reload
  useEffect(() => {
    if (web3Modal.cachedProvider) {
      loadWeb3Modal()
    }
  }, [loadWeb3Modal])

  const handleSignIn = async () => {
    const userSigner = user?.signer

    if (!guildUrlName) {
      console.error('Error in injection, guildUrlName is not set')
      setError('Error in injection, guildUrlName is not set')
      return
    }

    if (!web3Modal.cachedProvider) {
      console.error('Cannot handle authentication without provider')
      setError('Cannot handle authentication without provider')
      return
    }

    if (!userSigner) {
      console.error('Cannot handle authentication without user signer')
      setError('Cannot handle authentication without user signer')
      return
    }

    setIsSigning(true)

    const timeStamp = Date.now()
    try {
      // sign message using wallet
      const address = await userSigner.getAddress()
      const message = createMessage(guildUrlName, timeStamp)
      let signature = await userSigner.signMessage(message)
      const data = await ky
        .post('/api/sign-in', {
          json: { signature, address, timeStamp }
        })
        .json()

      console.log('body: ', data)

      Router.replace('/')
    } catch (e) {
      console.error(e)
      setError(e.message)
    }

    setIsSigning(false)
    setError(null)
  }

  if (tokenGatingTurnedOff()) {
    return <Page404 />
  }

  return (
    <>
      <PageHead title={'Sign In'} />

      <div className={styles.container}>
        <main className={styles.main}>
          <h1>Sign In</h1>

          {!injectedProvider ? (
            <button onClick={loadWeb3Modal} key='connnectWalletButton'>
              <h3>Connect Wallet</h3>
            </button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <button onClick={logoutOfWeb3Modal} key='disconnnectWalletButton'>
                <h3>Disconnect Wallet</h3>
              </button>

              <button
                onClick={handleSignIn}
                key='signInButton'
                style={{ marginTop: 16, alignSelf: 'stretch' }}
              >
                <h3>Sign In!</h3>
              </button>
            </div>
          )}

          {isSigning && <h3 style={{ marginTop: 16 }}>Loading...</h3>}
          {error && (
            <h4 style={{ overflowWrap: 'break-word', marginTop: 16 }}>
              {error}
            </h4>
          )}
        </main>
      </div>
    </>
  )
}

export default SignIn
