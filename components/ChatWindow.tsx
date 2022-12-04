import { Box, IconButton } from '@chakra-ui/react'
import type { Account } from '@nft/chat'
import { Chat as ChatComponent, ChatProvider, useChat } from '@nft/chat'
import { useSigner } from '@nft/hooks'
import { HiOutlineChevronDown } from '@react-icons/all-files/hi/HiOutlineChevronDown'
import { HiOutlineChevronUp } from '@react-icons/all-files/hi/HiOutlineChevronUp'
import request, { gql } from 'graphql-request'
import { PropsWithChildren, useCallback, useEffect, useState } from 'react'
import environment from '../environment'
import { theme } from '../styles/theme'

const DEFAULT_CHAT_HEIGHT = 480
const DEFAULT_CHAT_WIDTH = 356

const StorageKey = 'liteflow-chat'

const Chat = () => {
  const { signer } = useChat()
  const [open, setOpen] = useState(localStorage.getItem(StorageKey) === 'open')
  useEffect(() => {
    localStorage.setItem(StorageKey, open ? 'open' : 'close')
  }, [open])

  if (!signer) return null
  return (
    <Box
      zIndex="modal"
      position="fixed"
      right="6"
      bottom="0"
      transform={open ? '' : 'translateY(calc(100% - 58px))'}
      height={DEFAULT_CHAT_HEIGHT}
      width={DEFAULT_CHAT_WIDTH}
      roundedTop="2xl"
      overflow="hidden"
      boxShadow="2xl"
      border="1px"
      borderColor="grayAlpha.700"
      borderBottom="none"
    >
      <ChatComponent>
        <IconButton
          marginLeft="2"
          variant="tertiary"
          aria-label="toggle"
          size="sm"
          height="full"
          onClick={() => setOpen(!open)}
          icon={open ? <HiOutlineChevronDown /> : <HiOutlineChevronUp />}
        />
      </ChatComponent>
    </Box>
  )
}

const accounts = new Map<string, Promise<Account>>()

export default function ChatWindow({
  children,
}: PropsWithChildren<{}>): JSX.Element {
  const signer = useSigner()

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
    <ChatProvider
      signer={signer as any}
      theme={theme}
      lookupAddress={lookupAddress}
    >
      {children}
      <Chat />
    </ChatProvider>
  )
}
