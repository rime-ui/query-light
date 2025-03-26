

type CreateObserverOptions = {
  root?: Element | Document | null,
  rootMargin?: string,
  threshold?: number | number[]
}

type CreateObserverCallback = IntersectionObserverCallback

interface ReturnOptions {
  observe: (element: Element) => void,
  unobserve: (element: Element) => void,
  disconnect: () => void
}

export function createObserver(callback: CreateObserverCallback, options: CreateObserverOptions): ReturnOptions {
  const observer = new IntersectionObserver(callback, options)

  return {
    observe: (element) => observer.observe(element),
    unobserve: (element) => observer.unobserve(element),
    disconnect: () => observer.disconnect()
  }
}
