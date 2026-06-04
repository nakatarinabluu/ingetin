import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * 🟢 WHATSAPP MODERN PRO - SCROLL TO TOP
 * Helper to ensure page starts from top on navigation.
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
};

export default ScrollToTop;
