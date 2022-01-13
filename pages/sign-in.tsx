import { NextPage } from 'next'
import dynamic from 'next/dynamic'

const DynamicSignInWithNoSSR = dynamic(() => import('../components/SignIn'), {
  ssr: false
})

const SignInPage: NextPage = (props) => {
  return <DynamicSignInWithNoSSR {...props} />
}

export default SignInPage
