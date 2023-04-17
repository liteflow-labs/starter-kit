import { Box } from '@chakra-ui/react'
import type { Account } from '@nft/chat'
import { Chat as ChatComponent, ChatProvider } from '@nft/chat'
import request, { gql } from 'graphql-request'
import { NextPage } from 'next'
import { useCallback } from 'react'
import Head from '../components/Head'
import environment from '../environment'
import useEagerConnect from '../hooks/useEagerConnect'
import useLoginRedirect from '../hooks/useLoginRedirect'
import useSigner from '../hooks/useSigner'
import LargeLayout from '../layouts/large'
import { theme } from '../styles/theme'

const accounts = new Map<string, Promise<Account>>()

const ChatPage: NextPage = () => {
  const ready = useEagerConnect()
  const signer = useSigner()
  useLoginRedirect(ready)

  const lookupAddress = useCallback(async (address: string) => {
    const res = accounts.get(address)
    if (res) return res
    const promise = request(
      environment.GRAPHQL_URL,
      gql`
        query LookupAccount($address: Address!) {
          account(address: $address) {
            name
            image
          }
        }
      `,
      { address: address.toLowerCase() },
    ).then(({ account }) => ({
      name: account?.name || undefined,
      avatar: account?.image || undefined,
    }))

    accounts.set(address, promise)
    return promise
  }, [])

  return (
    <LargeLayout>
      <Head title="Chat" />
      <Box
        borderBlock="1px"
        borderInline={{ base: 'none', lg: '1px' }}
        // Need color definition for both breakpoints for some reason.
        // borderColor="gray.200" doesn't apply for both.
        borderColor={{ base: 'gray.200', lg: 'gray.200' }}
        rounded={{ base: 'none', lg: 'xl' }}
        height="50vh"
        overflow="hidden"
        mx={{ base: -6, lg: 0 }}
      >
        <ChatProvider
          signer={signer as any}
          theme={theme}
          lookupAddress={lookupAddress}
        >
          <ChatComponent />
        </ChatProvider>
      </Box>
    </LargeLayout>
  )
}

export default ChatPage
