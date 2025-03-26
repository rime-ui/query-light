import { createObserver } from "query-light-core/src/observer";
import { useEffect, useRef } from "react";

interface UseFetchInViewProps {
  fetchData: () => void | Promise<void>;
  threshold?: number;
  root?: Element | Document | null;
}

export function useFetchInView(props: UseFetchInViewProps) {
  const { fetchData, root, threshold } = props
  const elementRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const options = {
      root: root || null,
      threshold: threshold || 0.5
    };

    const callback = (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          fetchData()
          return;
        }
      });
    };

    const observer = createObserver(callback, options);


    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
      observer.disconnect();
    };

  }, [])

  return {
    elementRef,
  }
}
