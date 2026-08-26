import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import type { ReactNode } from 'react'
import { ColorModeProvider } from './color-mode'

export function Provider(props: { children?: ReactNode }) {
  return (
    <ChakraProvider value={defaultSystem}>
      <ColorModeProvider {...props} />
    </ChakraProvider>
  )
}
