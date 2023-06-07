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
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { FaBell } from '@react-icons/all-files/fa/FaBell'
import { FaEnvelope } from '@react-icons/all-files/fa/FaEnvelope'
import { HiChevronDown } from '@react-icons/all-files/hi/HiChevronDown'
import { HiOutlineMenu } from '@react-icons/all-files/hi/HiOutlineMenu'
import { HiOutlineSearch } from '@react-icons/all-files/hi/HiOutlineSearch'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'
import { FC, HTMLAttributes, useEffect, useRef, VFC } from 'react'
import { useCookies } from 'react-cookie'
import { useForm } from 'react-hook-form'
import { useDisconnect } from 'wagmi'
import { useNavbarAccountQuery } from '../../graphql'
import useAccount from '../../hooks/useAccount'
import Image from '../Image/Image'
import Link from '../Link/Link'
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
  multiLang?: MultiLang
  signOutFn: () => void
}> = ({ account, signOutFn, logo, multiLang }) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { asPath, events, query, push } = useRouter()
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
            <Link href="/create">
              <NavItemMobile>{t('navbar.create')}</NavItemMobile>
            </Link>
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
                <Link href="/chat">
                  <NavItemMobile>{t('navbar.chat')}</NavItemMobile>
                </Link>
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
                        locale: value?.toString(),
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
  signOutFn: () => void
}> = ({ account, user, signOutFn }) => {
  const { t } = useTranslation('components')
  return (
    <Menu>
      <MenuButton>
        <Flex>
          <Flex
            as={AccountImage}
            address={user.address || account}
            image={user.image}
            size={40}
            rounded="full"
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
        <MenuItem onClick={signOutFn}>{t('navbar.user.sign-out')}</MenuItem>
      </MenuList>
    </Menu>
  )
}

type FormData = {
  search: string
}

const Navbar: VFC<{
  logo?: {
    path: string
    width?: number
    height?: number
  }
  multiLang?: MultiLang
}> = ({ logo, multiLang }) => {
  const { t } = useTranslation('components')
  const { address, isLoggedIn, logout, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const { asPath, query, push, isReady, events } = useRouter()
  const { register, setValue, handleSubmit } = useForm<FormData>()
  const [cookies] = useCookies()
  const { openConnectModal } = useConnectModal()
  const lastNotification = cookies[`lastNotification-${address}`]
  const {
    data: accountData,
    refetch,
    previousData: previousAccountData,
  } = useNavbarAccountQuery({
    variables: {
      account: address?.toLowerCase() || '',
      lastNotification: new Date(lastNotification || 0),
    },
    skip: !isLoggedIn,
  })
  const account = isLoggedIn
    ? accountData?.account || previousAccountData?.account
    : undefined

  useEffect(() => {
    if (!isReady) return
    if (!query.search) return setValue('search', '')
    if (Array.isArray(query.search)) return setValue('search', '')
    setValue('search', query.search)
  }, [isReady, setValue, query.search])

  useEffect(() => {
    events.on('routeChangeStart', refetch)
    return () => {
      events.off('routeChangeStart', refetch)
    }
  }, [events, refetch])

  const onSubmit = handleSubmit((data) => {
    if (data.search) query.search = data.search
    else delete query.search
    delete query.skip // reset pagination
    delete query.page // reset pagination
    if (asPath.startsWith('/explore')) return push({ query })
    return push({ pathname: '/explore', query })
  })

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
          {account ? (
            <HStack spacing={2}>
              <ActivityMenu account={account.address} />
              <Link href="/chat">
                <IconButton
                  aria-label="Notifications"
                  variant="ghost"
                  colorScheme="gray"
                  rounded="full"
                  icon={
                    <Icon as={FaEnvelope} color="brand.black" h={4} w={4} />
                  }
                />
              </Link>
              <Link href="/notification">
                <IconButton
                  aria-label="Notifications"
                  variant="ghost"
                  colorScheme="gray"
                  rounded="full"
                  position="relative"
                >
                  <Flex>
                    <Icon as={FaBell} color="brand.black" h={4} w={4} />
                    {account.notifications.totalCount > 0 && (
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
                  </Flex>
                </IconButton>
              </Link>
              <UserMenu
                account={account.address}
                user={account}
                signOutFn={() => logout().then(disconnect)}
              />
            </HStack>
          ) : isConnected ? (
            <Button
              colorScheme="brand"
              isLoading
              loadingText={t('navbar.signing-in')}
            />
          ) : (
            <Button onClick={openConnectModal} colorScheme="brand">
              {t('navbar.sign-in')}
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
                    locale: value?.toString(),
                  })
                }
              />
            </Flex>
          )}
        </Flex>
        <Flex display={{ base: 'flex', lg: 'none' }} align="center">
          <DrawerMenu
            account={account?.address}
            logo={logo}
            multiLang={multiLang}
            signOutFn={() => logout().then(disconnect)}
          />
        </Flex>
      </Flex>
    </>
  )
}

export default Navbar
