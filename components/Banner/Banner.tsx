import Link from 'next/link'
import { FC } from 'react'

const Banner: FC = () => {
  return (
    <div className="fixed top-0 z-50 flex h-12 w-full translate-y-0 transform items-center bg-gray-700">
      <Link href="/">
        <a className="bg-brand-500 flex h-full w-12 items-center justify-center">
          <svg
            width="16"
            height="24"
            viewBox="0 0 16 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-6"
          >
            <path
              d="M0.204254 24V0H4.59574V20.3915H15.7957V24H0.204254Z"
              fill="white"
            />
          </svg>
        </a>
      </Link>
      <span className="ml-4 hidden text-sm font-semibold leading-5 text-white md:flex">
        NFT Marketplace as a Service
      </span>
      <div className="bg-brand-100 mx-3 hidden items-center rounded-full md:flex">
        <span className="text-brand-500 py-1 px-3 text-xs font-medium leading-4">
          Developer Preview
        </span>
      </div>
      <a
        href="https://calendly.com/anthony-estebe/liteflow-nft-marketplace"
        target="_blank"
        rel="noreferrer"
        className="mr-5 ml-auto flex items-center rounded bg-[#6CB310] py-1 px-3 shadow-sm hover:bg-[#55990B] lg:mr-8"
      >
        <span className="text-xs font-semibold leading-4 text-white">
          Schedule a Demo
        </span>
      </a>
    </div>
  )
}

export default Banner
