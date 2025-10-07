import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const handler = () => setIsMobile(mediaQuery.matches)
    
    // Initial check
    handler()

    // Listen for changes
    mediaQuery.addEventListener("change", handler)

    return () => mediaQuery.removeEventListener("change", handler)
  }, [])

  return isMobile
}
