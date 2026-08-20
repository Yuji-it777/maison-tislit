import { useState, FormEvent } from 'react';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../context/LanguageContext';
import Captcha from '../components/Captcha';
import SEO from '../components/SEO';

export default function LoginPage() {
  const { login, resetPassword, setCurrentPage } = useApp();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [captchaToken, setCaptchaToken] = useState('');
  const [resetting, setResetting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!captchaToken) {
      alert(t('security.captchaRequired'));
      return;
    }
    setLoading(true);
    const ok = await login(email, password);
    setLoading(false);
    if (ok) setCurrentPage('shop');
  };

  const handleForgotPassword = async () => {
    if (!email) {
      alert('Please enter your email address first');
      return;
    }
    setResetting(true);
    await resetPassword(email);
    setResetting(false);
  };

  return (
    <div className="pt-20 min-h-screen bg-stone-50 flex items-center justify-center px-4 py-12">
      <SEO noindex />
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-stone-800 via-brand to-stone-800 h-2" />

          <div className="p-8 sm:p-10">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-stone-800 mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                Maison Tislit
              </h1>
              <p className="text-brand text-xs tracking-[0.3em] uppercase mb-6">{t('login.title')}</p>

            </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="bg-brand border border-brand rounded-lg p-3 text-xs text-black">
                  {t('login.adminOnly')}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 tracking-wider uppercase mb-2">
                    {t('login.email')}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    maxLength={254}
                    autoComplete="email"
                    placeholder={t('login.emailPlaceholder')}
                    className="w-full border border-stone-200 rounded-lg px-4 py-3 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand transition-all"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-xs font-semibold text-stone-700 tracking-wider uppercase">
                      {t('login.password')}
                    </label>
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      disabled={resetting}
                      className="text-xs text-brand hover:text-brand disabled:opacity-50"
                    >
                      {resetting ? 'Sending...' : t('login.forgotPassword')}
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPwd ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      maxLength={128}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      className="w-full border border-stone-200 rounded-lg px-4 py-3 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand transition-all pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd(!showPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                    >
                      {showPwd ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <Captcha onSuccess={setCaptchaToken} onExpire={() => setCaptchaToken('')} />

                <button
                  type="submit"
                  disabled={loading || !captchaToken}
                  className="w-full bg-stone-800 hover:bg-brand disabled:opacity-50 text-white py-4 rounded-lg text-sm tracking-widest uppercase font-medium transition-all duration-300 hover:shadow-lg mt-2 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      {t('login.loggingIn')}
                    </>
                  ) : (
                    t('login.login')
                  )}
                </button>
              </form>
          </div>
        </div>

        <button
          onClick={() => setCurrentPage('home')}
          className="mt-6 w-full text-center text-sm text-stone-500 hover:text-stone-700 transition-colors"
        >
          {t('login.backToHome')}
        </button>
      </div>
    </div>
  );
}
