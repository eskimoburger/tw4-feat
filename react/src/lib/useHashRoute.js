import { useSyncExternalStore } from 'react'

function subscribe(callback) {
  window.addEventListener('hashchange', callback)
  return () => window.removeEventListener('hashchange', callback)
}

const getSnapshot = () => window.location.hash
const getServerSnapshot = () => ''

/**
 * Hash routing: "#/demo-id" -> "demo-id", "" or "#/" -> "" (the home view).
 * Because the whole hash is the route, demos should not use "#anchor" links.
 */
export function useHashRoute() {
  const hash = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const path = hash.replace(/^#\/?/, '')
  try {
    return decodeURIComponent(path)
  } catch {
    return path
  }
}
