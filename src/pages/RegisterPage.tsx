import { useState, FormEvent } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../context/LanguageContext';
import Captcha from '../components/Captcha';

export default function RegisterPage() {
  const { register, setCurrentPage } = useApp();
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [captchaToken, setCaptchaToken] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!captchaToken) {
      setError(t('security.captchaRequired'));
      return;
    }
    if (password !== confirm) {
      setError(t('register.passwordMismatch'));
      return;
    }
    if (password.length < 8) {
      setError(t('register.passwordTooShort'));
      return;
    }
    if (!/[A-Z]/.test(password)) {
      setError('Password must contain an uppercase letter');
      return;
    }
    if (!/[0-9]/.test(password)) {
      setError('Password must contain a number');
      return;
    }
    setLoading(true);
    const ok = await register(name, email, password);
    setLoading(false);
    if (ok) setCurrentPage('shop');
  };

  return (
    <div className="pt-20 min-h-screen bg-stone-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-brand via-brand to-stone-800 h-2" />

          <div className="p-8 sm:p-10">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-stone-800 mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                Maison Tislit
              </h1>
              <p className="text-brand text-xs tracking-[0.3em] uppercase mb-5">{t('register.title')}</p>

            </div>

            {error && (
              <div className="mb-5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-stone-700 tracking-wider uppercase mb-2">
                  {t('register.fullName')}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  placeholder={t('register.namePlaceholder')}
                  className="w-full border border-stone-200 rounded-lg px-4 py-3 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 tracking-wider uppercase mb-2">
                  {t('register.email')}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder={t('register.emailPlaceholder')}
                  className="w-full border border-stone-200 rounded-lg px-4 py-3 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 tracking-wider uppercase mb-2">
                  {t('register.password')}
                </label>
                <div className="relative">
                  <input
                    type={showPwd ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    placeholder="Min 8 chars, 1 uppercase, 1 number"
                    className="w-full border border-stone-200 rounded-lg px-4 py-3 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand transition-all pr-10"
                  />
                  <button type="button" onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors">
                    {showPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {password && (
                  <div className="mt-1.5 flex gap-1">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${
                        password.length > i * 3
                          ? password.length < 8 ? 'bg-red-400' : password.length < 12 ? 'bg-brand' : 'bg-emerald-500'
                          : 'bg-stone-200'
                      }`} />
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 tracking-wider uppercase mb-2">
                  {t('register.confirmPassword')}
                </label>
                <input
                  type="password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  required
                  placeholder={t('register.confirmPlaceholder')}
                  className={`w-full border rounded-lg px-4 py-3 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 transition-all
                    ${confirm && confirm !== password
                      ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                      : 'border-stone-200 focus:border-brand focus:ring-brand'
                    }`}
                />
                {confirm && confirm !== password && (
                  <p className="text-xs text-red-500 mt-1">{t('register.passwordMismatchHint')}</p>
                )}
              </div>

              <div className="flex items-start gap-3">
                <input type="checkbox" required id="terms" className="mt-0.5 accent-brand" />
                <label htmlFor="terms" className="text-xs text-stone-500 leading-relaxed">
                  {t('register.acceptTerms1')}
                  <span className="text-brand hover:underline cursor-pointer">{t('register.terms')}</span>
                  {t('register.and')}
                  <span className="text-brand hover:underline cursor-pointer">{t('register.privacyPolicy')}</span>
                  {t('register.of')}Maison Tislit
                </label>
              </div>

              <Captcha onSuccess={setCaptchaToken} onExpire={() => setCaptchaToken('')} />

              <button
                type="submit"
                disabled={loading || !captchaToken}
                className="w-full bg-brand hover:bg-brand disabled:opacity-50 text-white py-4 rounded-lg text-sm tracking-widest uppercase font-medium transition-all duration-300 hover:shadow-lg flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {t('register.creatingAccount')}
                  </>
                ) : (
                  t('register.createAccount')
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-stone-200" />
                <span className="text-xs text-stone-400">{t('register.or')}</span>
                <div className="flex-1 h-px bg-stone-200" />
              </div>
              <p className="text-sm text-stone-500">
                {t('register.hasAccount')}{' '}
                <button
                  onClick={() => setCurrentPage('login')}
                  className="text-brand font-semibold hover:text-brand hover:underline transition-colors"
                >
                  {t('register.login')}
                </button>
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setCurrentPage('home')}
          className="mt-6 w-full text-center text-sm text-stone-500 hover:text-stone-700 transition-colors"
        >
          {t('register.backToHome')}
        </button>
      </div>
    </div>
  );
}
