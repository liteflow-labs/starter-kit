import { extendTheme } from '@chakra-ui/react'

export const theme = extendTheme({
  breakPoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
  },
  components: {
    Button: {
      baseStyle: {
        rounded: 'xl',
      },
      defaultProps: {
        colorScheme: 'brand',
      },
    },
    Checkbox: {
      baseStyle: {
        container: {
          w: 'full',
          shadow: 'sm',
          rounded: 'xl',
          border: '1px',
          borderColor: 'gray.200',
          py: 2.5,
          px: 4,
        },
      },
      defaultProps: {
        colorScheme: 'brand',
      },
    },
    Link: {
      baseStyle: {
        textDecoration: 'none',
        _hover: {
          textDecoration: 'none',
        },
        _focus: {
          textDecoration: 'none',
        },
        _visited: {
          textDecoration: 'none',
        },
        _active: {
          textDecoration: 'none',
        },
      },
    },
    Heading: {
      variants: {
        title: {
          fontSize: '36px',
          lineHeight: '40px',
          fontWeight: 800,
        },
        subtitle: {
          fontSize: '24px',
          lineHeight: '32px',
          fontWeight: 700,
        },
        heading1: {
          fontSize: '20px',
          lineHeight: '28px',
          fontWeight: 700,
        },
        heading2: {
          fontSize: '16px',
          lineHeight: '24px',
          fontWeight: 600,
        },
        heading3: {
          fontSize: '16px',
          lineHeight: '24px',
          fontWeight: 500,
        },
        heading4: {
          fontSize: '14px',
          lineHeight: '20px',
          fontWeight: 700,
        },
      },
    },
    Text: {
      variants: {
        text: {
          fontSize: '16px',
          lineHeight: '24px',
          fontWeight: 400,
        },
        'text-sm': {
          fontSize: '14px',
          lineHeight: '20px',
          fontWeight: 400,
        },
        subtitle1: {
          fontSize: '16px',
          lineHeight: '24px',
          fontWeight: 500,
        },
        subtitle2: {
          fontSize: '14px',
          lineHeight: '20px',
          fontWeight: 500,
        },
        button1: {
          fontSize: '16px',
          lineHeight: '24px',
          fontWeight: 600,
        },
        button2: {
          fontSize: '14px',
          lineHeight: '20px',
          fontWeight: 600,
        },
        caption: {
          fontSize: '12px',
          lineHeight: '16px',
          fontWeight: 400,
        },
        error: {
          fontSize: '14px',
          lineHeight: '20px',
          fontWeight: 500,
          color: 'red.500',
        },
      },
    },
  },
  fonts: {
    banner: 'Poppins',
  },
  colors: {
    white: '#FFFFFF',
    black: '#000000',
    blue: {
      50: '#EFF6FF',
      100: '#DBEAFE',
      300: '#93C5FD',
      500: '#3B82F6',
      600: '#2563EB',
    },
    brand: {
      50: '#F5F7FF',
      100: '#D3E2FF',
      200: '#A7C4FF',
      300: '#7BA3FF',
      400: '#5A88FF',
      500: '#245BFF',
      600: '#1A45DB',
      700: '#1233B7',
      800: '#0B2393',
      900: '#06177A',
      black: '#060F27',
    },
    secondary: {
      100: '#C9FBCB',
      500: '#02B14F',
      black: '#232323',
      accent: '#08C725',
    },
    gray: {
      100: '#F3F4F6',
      200: '#E5E7Eb',
      300: '#D1D5Db',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
    },
    green: {
      50: '#ECFDF5',
      300: '#6EE7B7',
      500: '#10B981',
    },
    orange: {
      50: '#FFF7ED',
      300: '#FDBA74',
      500: '#F97316',
    },
    red: {
      50: '#FEF2F2',
      100: '#FEE2E2',
      300: '#FCA5A5',
      500: '#EF4444',
      900: '#7F1D1D',
    },
  },
  radii: {
    none: '0',
    sm: '12px',
    base: '12px',
    md: '12px',
    lg: '12px',
    xl: '12px',
    '2xl': '12px',
    '3xl': '12px',
    full: '9999px',
  },
})
