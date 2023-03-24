import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  As,
  Box,
  Button,
  Divider,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  HStack,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  useDisclosure,
} from '@chakra-ui/react'
import { Signer } from '@ethersproject/abstract-signer'
import { EmailConnector } from '@nft/email-connector'
import { useAddFund } from '@nft/hooks'
import { FaBell } from '@react-icons/all-files/fa/FaBell'
import { HiChevronDown } from '@react-icons/all-files/hi/HiChevronDown'
import { HiOutlineMenu } from '@react-icons/all-files/hi/HiOutlineMenu'
import { HiOutlineSearch } from '@react-icons/all-files/hi/HiOutlineSearch'
import { useWeb3React } from '@web3-react/core'
import { InjectedConnector } from '@web3-react/injected-connector'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'
import { WalletLinkConnector } from '@web3-react/walletlink-connector'
import WelcomeModal from 'components/Modal/Welcome'
import useTranslation from 'next-translate/useTranslation'
import { MittEmitter } from 'next/dist/shared/lib/mitt'
import Image from 'next/image'
import {
  FC,
  HTMLAttributes,
  useCallback,
  useEffect,
  useRef,
  useState,
  VFC,
} from 'react'
import { useCookies } from 'react-cookie'
import { useForm } from 'react-hook-form'
import { useNavbarAccountQuery } from '../../graphql'
import Link from '../Link/Link'
import LoginModal from '../Modal/Login'
import Select from '../Select/Select'
import AccountImage from '../Wallet/Image'

type MultiLang = {
  pathname: string
  locale: string | undefined
  choices: {
    value: string
    label: string
  }[]
}

// Mobile navigation item
const NavItemMobile: FC<HTMLAttributes<any> & { as?: As<any> | undefined }> = ({
  children,
  as = 'span',
  ...props
}) => {
  return (
    <Box
      as={as}
      display="block"
      py={2}
      pr={4}
      pl={3}
      fontWeight="medium"
      borderColor="gray.200"
      borderLeftWidth="4px"
      color="gray.600"
      cursor="pointer"
      _hover={{
        bgColor: 'brand.50',
        color: 'gray.800',
        borderColor: 'brand.200',
      }}
      {...props}
    >
      {children}
    </Box>
  )
}

// Mobile navigation
const DrawerMenu: VFC<{
  account: string | null | undefined
  logo?: {
    path: string
    width?: number
    height?: number
  }
  router: {
    asPath: string
    query: any
    push: (url: any, as?: any, options?: any) => Promise<boolean>
    events: MittEmitter<'routeChangeStart'>
  }
  multiLang?: MultiLang
  topUp: {
    allowTopUp: boolean
    addFund: () => Promise<void>
    addingFund: boolean
  }
  disableMinting?: boolean
  signOutFn: () => void
}> = ({
  account,
  signOutFn,
  logo,
  router,
  multiLang,
  topUp,
  disableMinting,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { asPath, events, query, push } = router
  const { t } = useTranslation('components')
  const btnRef = useRef(null)

  useEffect(() => {
    events.on('routeChangeStart', () => onClose())
    return () => {
      events.off('routeChangeStart', () => onClose())
    }
  }, [events, onClose])

  return (
    <>
      <IconButton
        ref={btnRef}
        onClick={onOpen}
        icon={<HiOutlineMenu color="gray" size={24} />}
        aria-label="Open menu"
        variant="ghost"
        colorScheme="gray"
      />
      <Drawer
        isOpen={isOpen}
        onClose={onClose}
        finalFocusRef={btnRef}
        placement="left"
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>
            <Link href="/" onClick={onClose}>
              <Image
                src={logo?.path || '/logo.svg'}
                alt="Logo"
                width={logo?.width || 139}
                height={logo?.height || 32}
              />
            </Link>
          </DrawerHeader>
          <DrawerBody px={0} mt={8}>
            <Link href="/explore">
              <NavItemMobile>{t('navbar.explore')}</NavItemMobile>
            </Link>
            {!disableMinting && (
              <Link href="/create">
                <NavItemMobile>{t('navbar.create')}</NavItemMobile>
              </Link>
            )}
            {account ? (
              <>
                <Accordion as="nav" allowMultiple>
                  <AccordionItem border="none">
                    <AccordionButton
                      py={2}
                      pr={4}
                      pl={3}
                      fontWeight="medium"
                      borderColor="gray.200"
                      borderLeftWidth="4px"
                      color="gray.600"
                      _hover={{
                        color: 'gray.800',
                        borderColor: 'brand.200',
                        bgColor: 'brand.50',
                      }}
                    >
                      <Text variant="subtitle1" textAlign="left" flex="1">
                        {t('navbar.activity.title')}
                      </Text>
                      <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel pt={2} pb={1} pl={3} pr={0}>
                      <Link href={`/users/${account}/bids`} w="full">
                        <NavItemMobile>
                          {t('navbar.activity.bids')}
                        </NavItemMobile>
                      </Link>
                      <Link href={`/users/${account}/trades`} w="full">
                        <NavItemMobile>
                          {t('navbar.activity.trades')}
                        </NavItemMobile>
                      </Link>
                      <Link href={`/users/${account}/offers`} w="full">
                        <NavItemMobile>
                          {t('navbar.activity.offers')}
                        </NavItemMobile>
                      </Link>
                    </AccordionPanel>
                  </AccordionItem>
                </Accordion>
                <Link href="/notification">
                  <NavItemMobile>{t('navbar.notifications')}</NavItemMobile>
                </Link>
                <Accordion as="nav" allowMultiple>
                  <AccordionItem border="none">
                    <AccordionButton
                      py={2}
                      pr={4}
                      pl={3}
                      fontWeight="medium"
                      borderColor="gray.200"
                      borderLeftWidth="4px"
                      color="gray.600"
                      _hover={{
                        color: 'gray.800',
                        borderColor: 'brand.200',
                        bgColor: 'brand.50',
                      }}
                    >
                      <Text variant="subtitle1" textAlign="left" flex="1">
                        {t('navbar.user.title')}
                      </Text>
                      <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel pt={2} pb={1} pl={3} pr={0}>
                      <Link href={`/users/${account}`}>
                        <NavItemMobile>
                          {t('navbar.user.profile')}
                        </NavItemMobile>
                      </Link>
                      <Link href={`/account/wallet`}>
                        <NavItemMobile>{t('navbar.user.wallet')}</NavItemMobile>
                      </Link>
                      <Link href={`/account/edit`}>
                        <NavItemMobile>{t('navbar.user.edit')}</NavItemMobile>
                      </Link>
                      {topUp.allowTopUp && (
                        <NavItemMobile
                          onClick={
                            topUp.addingFund ? undefined : () => topUp.addFund()
                          }
                          as="span"
                        >
                          {t('navbar.user.top-up')}
                        </NavItemMobile>
                      )}
                      <NavItemMobile onClick={signOutFn}>
                        {t('navbar.user.sign-out')}
                      </NavItemMobile>
                    </AccordionPanel>
                  </AccordionItem>
                </Accordion>
              </>
            ) : (
              <Link href="/login">
                <NavItemMobile>{t('navbar.sign-in')}</NavItemMobile>
              </Link>
            )}
            {multiLang && (
              <>
                <Divider mx={3} mt={4} w="auto" />
                <Flex pl={3} pr={4} pt={6} pb={4}>
                  <Select
                    label=""
                    name="lang"
                    choices={multiLang.choices}
                    value={multiLang.locale}
                    onChange={(value) =>
                      push({ pathname: multiLang.pathname, query }, asPath, {
                        locale: value,
                      })
                    }
                  />
                </Flex>
              </>
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  )
}

// Activity menu for desktop. Only visible when signed in
const ActivityMenu: VFC<{ account: string }> = ({ account }) => {
  const { t } = useTranslation('components')
  return (
    <Menu>
      <MenuButton color="brand.black" _hover={{ color: 'gray.500' }}>
        <HStack spacing={2}>
          <Text as="span" variant="button2">
            {t('navbar.activity.title')}
          </Text>
          <HiChevronDown />
        </HStack>
      </MenuButton>
      <MenuList>
        <Link href={`/users/${account}/bids`} w="full">
          <MenuItem>{t('navbar.activity.bids')}</MenuItem>
        </Link>
        <Link href={`/users/${account}/trades`} w="full">
          <MenuItem>{t('navbar.activity.trades')}</MenuItem>
        </Link>
        <Link href={`/users/${account}/offers`} w="full">
          <MenuItem>{t('navbar.activity.offers')}</MenuItem>
        </Link>
      </MenuList>
    </Menu>
  )
}

// Account menu for desktop. Only visible when signed in
const UserMenu: VFC<{
  account: string
  user: {
    address: string
    image: string | null
  }
  topUp: {
    allowTopUp: boolean
    addFund: () => Promise<void>
    addingFund: boolean
  }
  signOutFn: () => void
}> = ({ account, user, topUp, signOutFn }) => {
  const { t } = useTranslation('components')
  return (
    <Menu>
      <MenuButton>
        <Flex>
          <Box
            as={AccountImage}
            rounded="full"
            address={user.address || account}
            image={user.image}
            size={40}
          />
        </Flex>
      </MenuButton>
      <MenuList>
        <Link href={`/users/${account}`}>
          <MenuItem>{t('navbar.user.profile')}</MenuItem>
        </Link>
        <Link href="/account/wallet">
          <MenuItem>{t('navbar.user.wallet')}</MenuItem>
        </Link>
        <Link href="/account/edit">
          <MenuItem>{t('navbar.user.edit')}</MenuItem>
        </Link>
        {topUp.allowTopUp && (
          <MenuItem disabled={topUp.addingFund} onClick={() => topUp.addFund()}>
            {t('navbar.user.top-up')}
          </MenuItem>
        )}
        <MenuItem onClick={signOutFn}>{t('navbar.user.sign-out')}</MenuItem>
      </MenuList>
    </Menu>
  )
}

const WELCOME_MODAL_STORAGE_KEY = 'DEFYWelcomeModalViewed'

type FormData = {
  search: string
}

const Navbar: VFC<{
  allowTopUp: boolean
  disableMinting?: boolean
  logo?: {
    path: string
    width?: number
    height?: number
  }
  router: {
    asPath: string
    query: any
    push: (url: any, as?: any, options?: any) => Promise<boolean>
    isReady: boolean
    events: MittEmitter<'routeChangeStart'>
  }
  login: {
    email?: EmailConnector
    injected?: InjectedConnector
    walletConnect?: WalletConnectConnector
    coinbase?: WalletLinkConnector
    networkName: string
  }
  signer: Signer | undefined
  multiLang?: MultiLang
}> = ({
  allowTopUp,
  logo,
  router,
  login,
  multiLang,
  disableMinting,
  signer,
}) => {
  const { t } = useTranslation('components')
  const {
    isOpen: isLoginOpen,
    onOpen: onOpenLogin,
    onClose: onCloseLogin,
  } = useDisclosure()
  const {
    isOpen: isWelcomeOpen,
    onOpen: onOpenWelcome,
    onClose: onCloseWelcome,
  } = useDisclosure()
  const { account: accountWithChecksum, deactivate } = useWeb3React()
  const account = accountWithChecksum?.toLowerCase()
  const { asPath, query, push, isReady } = router
  const { register, setValue, handleSubmit } = useForm<FormData>()
  const [addFund, { loading: addingFund }] = useAddFund(signer)
  const [cookies] = useCookies()
  const lastNotification = cookies[`lastNotification-${account}`]
  const { data, refetch } = useNavbarAccountQuery({
    variables: {
      account: account?.toLowerCase() || '',
      lastNotification: new Date(lastNotification || 0),
    },
    skip: !account,
  })

  const [hasViewedWelcome, setHasViewedWelcome] = useState(
    localStorage.getItem(WELCOME_MODAL_STORAGE_KEY) === 'true',
  )

  const handleOnCloseWelcome = useCallback(() => {
    onCloseWelcome()
    setHasViewedWelcome(true)

    if (typeof window !== 'undefined') {
      localStorage.setItem(WELCOME_MODAL_STORAGE_KEY, 'true')
    }
  }, [onCloseWelcome])

  const onSubmit = handleSubmit((data) => {
    if (data.search) query.search = data.search
    else delete query.search
    delete query.skip // reset pagination
    return push({ pathname: '/explore', query })
  })

  useEffect(() => {
    if (!isReady) return
    if (!query.search) return setValue('search', '')
    if (Array.isArray(query.search)) return setValue('search', '')
    setValue('search', query.search)
  }, [isReady, setValue, query.search])

  useEffect(() => {
    router.events.on('routeChangeStart', refetch)
    return () => {
      router.events.off('routeChangeStart', refetch)
    }
  }, [router.events, refetch])

  // Handle welcome screen state
  useEffect(() => {
    if (hasViewedWelcome === false) {
      onOpenWelcome()
    }
  }, [hasViewedWelcome, onOpenWelcome])

  return (
    <>
      <Flex mx="auto" h={16} gap={6} px={{ base: 6, lg: 8 }} maxW="7xl">
        <Flex align="center">
          <Flex as={Link} href="/">
            <Image
              src={logo?.path || '/logo.svg'}
              alt="Logo"
              width={logo?.width || 139}
              height={logo?.height || 32}
            />
          </Flex>
        </Flex>
        <Flex as="form" my="auto" grow={1} onSubmit={onSubmit}>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <Icon as={HiOutlineSearch} w={6} h={6} color="gray.400" />
            </InputLeftElement>
            <Input placeholder={t('navbar.search')} {...register('search')} />
          </InputGroup>
        </Flex>
        <Flex display={{ base: 'none', lg: 'flex' }} align="center" gap={6}>
          <Flex
            as={Link}
            href="/explore"
            color="brand.black"
            align="center"
            _hover={{ color: 'gray.500' }}
          >
            <Text as="span" variant="button2">
              {t('navbar.explore')}
            </Text>
          </Flex>
          {!disableMinting && (
            <Flex
              as={Link}
              href="/create"
              color="brand.black"
              align="center"
              _hover={{ color: 'gray.500' }}
            >
              <Text as="span" variant="button2">
                {t('navbar.create')}
              </Text>
            </Flex>
          )}
          {account && data?.account ? (
            <>
              <ActivityMenu account={account} />
              <Link href="/notification">
                <IconButton
                  aria-label="Notifications"
                  variant="ghost"
                  colorScheme="gray"
                  rounded="full"
                  position="relative"
                >
                  <div>
                    <Icon as={FaBell} color="brand.black" h={4} w={4} />
                    {data.account.notifications.totalCount > 0 && (
                      <Flex
                        position="absolute"
                        top={2}
                        right={2}
                        h={2.5}
                        w={2.5}
                        align="center"
                        justify="center"
                        rounded="full"
                        bgColor="red.500"
                      />
                    )}
                  </div>
                </IconButton>
              </Link>
              <UserMenu
                account={account}
                topUp={{ allowTopUp, addFund, addingFund }}
                user={data.account}
                signOutFn={deactivate}
              />
            </>
          ) : (
            <Button onClick={onOpenLogin}>
              <Text as="span" isTruncated>
                {t('navbar.sign-in')}
              </Text>
            </Button>
          )}
          {multiLang && (
            <Flex display={{ base: 'none', lg: 'flex' }} align="center">
              <Select
                name="lang"
                choices={multiLang.choices}
                value={multiLang.locale}
                onChange={(value) =>
                  push({ pathname: multiLang.pathname, query }, asPath, {
                    locale: value,
                  })
                }
              />
            </Flex>
          )}
        </Flex>
        <Flex display={{ base: 'flex', lg: 'none' }} align="center">
          <DrawerMenu
            account={account}
            logo={logo}
            router={router}
            multiLang={multiLang}
            topUp={{ allowTopUp, addFund, addingFund }}
            disableMinting={disableMinting}
            signOutFn={deactivate}
          />
        </Flex>
      </Flex>

      <LoginModal isOpen={isLoginOpen} onClose={onCloseLogin} {...login} />

      <WelcomeModal isOpen={isWelcomeOpen} onClose={handleOnCloseWelcome} />
    </>
  )
}

export default Navbar
