// hooks/usePrefetch.ts
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export const usePrefetch = () => {
  const router = useRouter();

  useEffect(() => {
    const handleHover = (event: MouseEvent) => {
      const target = event.currentTarget as HTMLAnchorElement;
      const href = target.getAttribute('href');
      if (href && href.startsWith('/')) {
        router.prefetch(href);
      }
    };

    const links = document.querySelectorAll('.internal-link');
    links.forEach(link => {
      link.addEventListener('mouseenter', handleHover);
      link.addEventListener('touchstart', handleHover);
    });

    return () => {
      links.forEach(link => {
        link.removeEventListener('mouseenter', handleHover);
        link.removeEventListener('touchstart', handleHover);
      });
    };
  }, [router]);
};