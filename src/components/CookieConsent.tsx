import { useEffect, useState } from 'react';
import { useTranslation } from '../context/LanguageContext';
import {
  acceptConsent,
  clearStoredConsent,
  CONSENT_RESET_EVENT,
  declineConsent,
  readStoredConsent,
  updateConsent,
  type ConsentChoice,
} from '../utils/analytics';

/** Simple Accept / Decline cookie banner driving Google Consent Mode v2.
 *  GA loads only after Accept; the choice persists in localStorage.
 *  Hidden from automated browsers so prerender snapshots stay clean. */
export default function CookieConsent() {
  const { t } = useTranslation();
  const [choice, setChoice] = useState<ConsentChoice | null>(() => readStoredConsent());

  // Re-apply a stored Accept on every visit (library loads only then).
  useEffect(() => {
    if (readStoredConsent() === 'granted') acceptConsent();
  }, []);

  // Footer "Cookie settings" withdraws consent and re-opens the banner.
  useEffect(() => {
    const onReset = () => {
      clearStoredConsent();
      updateConsent(false);
      setChoice(null);
    };
    window.addEventListener(CONSENT_RESET_EVENT, onReset);
    return () => window.removeEventListener(CONSENT_RESET_EVENT, onReset);
  }, []);

  if (typeof navigator !== 'undefined' && navigator.webdriver) return null;
  if (choice !== null) return null;

  const decide = (c: ConsentChoice) => {
    if (c === 'granted') acceptConsent();
    else declineConsent();
    setChoice(c);
  };

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label={t('cookie.title')}
      className="fixed bottom-0 inset-x-0 z-[60] px-4 pb-4 sm:px-6 sm:pb-6"
    >
      <div className="max-w-3xl mx-auto bg-stone-900 text-stone-200 rounded-xl shadow-2xl border border-stone-700 px-5 py-4 sm:px-6">
        <p className="text-sm leading-relaxed mb-4">{t('cookie.message')}</p>
        <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
          <button
            type="button"
            onClick={() => decide('denied')}
            className="px-5 py-2.5 text-xs font-semibold tracking-widest uppercase rounded border border-stone-600 text-stone-300 hover:border-brand hover:text-brand transition-colors"
          >
            {t('cookie.decline')}
          </button>
          <button
            type="button"
            onClick={() => decide('granted')}
            className="px-5 py-2.5 text-xs font-semibold tracking-widest uppercase rounded bg-brand text-white hover:bg-amber-700 transition-colors"
          >
            {t('cookie.accept')}
          </button>
        </div>
      </div>
    </div>
  );
}
