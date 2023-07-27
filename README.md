# Marketplace template

This repository is an example of an application running on the [Liteflow](https://liteflow.com) infrastructure to showcase the uses of the infrastructure and/or be used as a starter kit to launch a product fast.

## Features included

The Marketplace template includes the following features:

- Open collections (User-generated content)
  - Mint ERC-721
  - Mint ERC-1155
  - Creator's royalties support
- Homepage content customization
  - Featured NFTs
  - Featured collections
  - Featured users
  - Auctions ending soon
  - Custom section with featured elements
- Search system
  - Search NFTs
  - Search collections
  - Search users
- Explore NFTs, collections and users with filtering and sorting systems
  - Explore NFTs
    - Filter by chain
    - Filter by status
    - Filter by price
    - Filter by collection
    - Filter by traits
    - Sort by dates
  - Explore collections
    - Filter by chain
    - Sort by volumes
  - Explore users
- Native currency and ERC20 support
- List NFTs on sale
  - Partial filling
  - Fixed price listing
  - Timed auction listing
- Make offers on NFTs
  - Partial filling
  - Open offer
  - Timed auction offer
- Purchase NFTs
- User profile
  - Account
    - Profile edition
    - Wallet page
  - NFTs "on sale"
  - NFTs "owned"
  - NFTs "created"
  - Offers ("bids") management
  - Trades history
  - Listings ("offers") management
- User verification system (verified status)
- Report system
  - Report a user
  - Report an NFT
- Notifications
  - In-app notifications
  - Email notifications
- NFT details
  - Chain information
  - Explorer link
  - Media IPFS link
  - Metadata IPFS link
  - Traits with percentages
- NFT history (activity)
  - Minted
  - Listed
  - Purchased
  - Transferred
- Wallet connection with
  - Metamask
  - Coinbase
  - WalletConnect
  - Magic
  - Rainbow
- Multi-chain support

It also includes compatibility with the following features:

- Multi-language compatibility
- Credit card payment gateway compatibility
- Email connection compatibility
- Wallet-to-wallet messaging system

## Additional Paid Features Showcased

The Marketplace template showcases the following additional paid features:

- Lazymint for NFTs
  - Lazymint history (activity)
- Unlockable content for NFTs
- Multi currency support
- Advanced fee customization support

## Libraries used

The Marketplace template is based on the following tech stack

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [Typescript](https://www.typescriptlang.org/)
- [Liteflow](https://liteflow.com/)
- [ChakraUI](https://chakra-ui.com/)
- [Wagmi](https://wagmi.sh/)
- [Rainbowkit](https://rainbowkit.com/)
- [Next translate](https://github.com/aralroca/next-translate)

## Get started

To get started, start by configuring your environmental variables in the `.env` file, referring to the `.env.example` file as a guide.
For further customization, an optional option is to utilize the `environment.ts` file.

Once done you can install all the dependencies with `npm i` then run

```
npm run dev
```

Your application is now accessible at http://localhost:3000

## Customization

#### Theme

The theme is based on [ChakraUI](https://chakra-ui.com/) and can be [customized](https://chakra-ui.com/docs/styled-system/customize-theme) in the `/styles/theme.ts` file.

#### Application

Your application includes default navigation, metadata, and wallets that can be updated directly from the `pages/_app.tsx` file.
