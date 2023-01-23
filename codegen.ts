import { CodegenConfig } from '@graphql-codegen/cli'

const contentfulSpaceId = process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID || ''

const contentfulEnvironment =
  process.env.NEXT_PUBLIC_CONTENTFUL_ENVIRONMENT_ID || ''

const contentfulAccessToken =
  process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN || ''

const contentfulSchema =
  `https://graphql.contentful.com/content/v1/spaces/${contentfulSpaceId}/environments/${contentfulEnvironment}` as string

console.log(contentfulAccessToken)

const config: CodegenConfig = {
  generates: {
    './graphql.ts': {
      schema: './node_modules/@nft/api-graphql/schema.graphql',
      documents: ['./pages/**/*.gql', './layouts/**/*.gql'],
      plugins: [
        'typescript',
        'typescript-operations',
        'typescript-react-apollo',
      ],
      config: {
        avoidOptionals: true,
        enumsAsTypes: true,
        scalars: {
          URI: 'URI',
          UUID: 'UUID',
          Datetime: 'Date',
          Cursor: 'string',
          JSON: '{ [key: string]: any }',
          Uint256: 'string',
          Address: 'string',
          TransactionHash: 'string',
          BigFloat: 'string',
        },
      },
    },
    './contentful-graphql.ts': {
      schema: [
        {
          [contentfulSchema]: {
            headers: {
              Authorization: `Bearer ${contentfulAccessToken}`,
            },
          },
        },
      ],
      documents: ['./contentful/**/*.gql'],
      plugins: [
        'typescript',
        'typescript-operations',
        'typescript-react-apollo',
      ],
    },
  },
}

export default config

// generates:
//   graphql.ts:
//     config:
//       avoidOptionals: true
//       enumsAsTypes: true
//       scalars:
//         URI: 'URI'
//         UUID: 'UUID'
//         Datetime: 'Date'
//         Cursor: 'string'
//         JSON: '{ [key: string]: any }'
//         Uint256: 'string'
//         Address: 'string'
//         TransactionHash: 'string'
//         BigFloat: 'string'
//   content-graphql.ts:
//     schema:
//       - 'https://graphql.contentful.com/content/v1/spaces/${NEXT_PUBLIC_CONTENTFUL_SPACE_ID}/environments/${NEXT_PUBLIC_CONTENTFUL_ENVIRONMENT_ID}':
//           headers:
//             Authorization: 'Bearer ${NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN}'
//     documents:
//       - './content/**/*.gql'
//     plugins:
//       - 'typescript'
//       - 'typescript-operations'
//       - 'typescript-react-apollo'
