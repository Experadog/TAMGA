'use client';

import { useEffect, useRef, useState } from 'react';

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

export default function useRecaptcha({ locale, t }) {
  const recaptchaRef = useRef(null);
  const widgetIdRef = useRef(null);

  const [captchaToken, setCaptchaToken] = useState('');
  const [isReady, setIsReady] = useState(false);
  const [errors, setErrors] = useState(null);

  // Загружаем скрипт Google reCAPTCHA
  useEffect(() => {
    const loadScript = () => {
      const existing = document.getElementById('recaptcha-script');

      if (existing) {
        if (window.grecaptcha && typeof window.grecaptcha.render === 'function') {
          setIsReady(true);
        } else {
          existing.addEventListener('load', () => setIsReady(true), { once: true });
        }
        return;
      }

      const script = document.createElement('script');
      script.id = 'recaptcha-script';
      script.src = `https://www.google.com/recaptcha/api.js?hl=${locale}`;
      script.async = true;
      script.defer = true;
      script.onload = () => setIsReady(true);
      script.onerror = () => setErrors(t('captcha.error'));
      document.body.appendChild(script);
    };

    loadScript();
  }, [locale, t]); // ИЗМЕНЕНО: добавлен t в зависимости

  // Инициализация виджета
  const initRecaptcha = () => {
    if (!isReady || !recaptchaRef.current) return;

    if (!SITE_KEY) {
      console.error('Missing NEXT_PUBLIC_RECAPTCHA_SITE_KEY');
      return;
    }

    if (!window.grecaptcha || typeof window.grecaptcha.render !== 'function') return;

    if (widgetIdRef.current !== null) return;

    const id = window.grecaptcha.render(recaptchaRef.current, {
      sitekey: SITE_KEY,
      callback: (token) => {
        setCaptchaToken(token);
        setErrors(null);
      },
      'expired-callback': () => {
        setCaptchaToken('');
        setErrors(t('captcha.repeat'));
      },
      'error-callback': () => {
        setCaptchaToken('');
        setErrors(t('captcha.refresh'));
      },
    });

    widgetIdRef.current = id;
  };

  // reset()
  const resetRecaptcha = () => {
    if (window.grecaptcha && typeof window.grecaptcha.reset === 'function' && widgetIdRef.current != null) {
      window.grecaptcha.reset(widgetIdRef.current);
    }
    widgetIdRef.current = null;
    setCaptchaToken('');
    setErrors(null);
  };

  return {
    recaptchaRef,
    captchaToken,
    errors,
    initRecaptcha,
    resetRecaptcha,
  };
}