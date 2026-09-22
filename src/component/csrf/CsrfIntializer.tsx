"use client";

import { useEffect } from 'react';
import { setupCSRFInterceptor } from '@/utils/csrfInterceptor';

export function CSRFInitializer() {
  useEffect(() => {
    setupCSRFInterceptor();
  }, []);

  return null;
}