import { useBreakpoint, useMemo } from 'vooks'

export function useIsMobile() {
  const breakpoint = useBreakpoint()
  return useMemo(() => {
    return breakpoint.value === 'xs'
  })
}

export function useIsTablet() {
  const breakpoint = useBreakpoint()
  return useMemo(() => {
    return breakpoint.value === 's'
  })
}

export function useIsSmallDesktop() {
  const breakpoint = useBreakpoint()
  return useMemo(() => {
    return breakpoint.value === 'm'
  })
}
