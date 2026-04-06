import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, EyeOff, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LineLogo from './LineLogo';

const LoginPage: React.FC = () => {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState<'email' | 'password' | null>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Preencha todos os campos.');
      return;
    }
    setError(null);
    setIsSubmitting(true);

    const { error: loginError } = await signIn(email.trim(), password);
    if (loginError) {
      setError(loginError);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      {/* Animated background — Updated for Red Line identity */}
      <div className="login-bg">
        <div className="login-bg-orb login-bg-orb--1" />
        <div className="login-bg-orb login-bg-orb--2" />
        <div className="login-bg-orb login-bg-orb--3" />
        <div className="login-bg-grid" />
        <div className="login-bg-noise" />
      </div>

      {/* Login card */}
      <motion.div
        className="login-card"
        initial={{ opacity: 0, y: 32, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Glow effect */}
        <div className="login-card-glow" />

        {/* Logo / Brand */}
        <motion.div
          className="login-brand"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <div className="login-logo-container">
            <div className="login-logo-wrapper">
              <LineLogo className="login-logo-svg" />
            </div>
          </div>
          <h1 className="login-title">LINE OS</h1>
          <p className="login-subtitle">Sistema operacional da Agência LINE</p>
        </motion.div>

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit}
          className="login-form"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          {/* Email field */}
          <div className={`login-field ${focusedField === 'email' ? 'login-field--focused' : ''} ${email ? 'login-field--filled' : ''}`}>
            <label className="login-label" htmlFor="login-email">
              <Mail size={14} />
              <span>E-mail</span>
            </label>
            <input
              ref={emailRef}
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(null); }}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
              placeholder="Digite seu e-mail corporativo"
              autoComplete="email"
              className="login-input"
              disabled={isSubmitting}
            />
          </div>

          {/* Password field */}
          <div className={`login-field ${focusedField === 'password' ? 'login-field--focused' : ''} ${password ? 'login-field--filled' : ''}`}>
            <label className="login-label" htmlFor="login-password">
              <Lock size={14} />
              <span>Senha</span>
            </label>
            <div className="login-input-wrapper">
              <input
                ref={passwordRef}
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(null); }}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="login-input"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="login-toggle-pw"
                tabIndex={-1}
                aria-label={showPassword ? 'Esconder senha' : 'Mostrar senha'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Error message */}
          <AnimatePresence>
            {error && (
              <motion.div
                className="login-error"
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -8, height: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                <div className="login-error-content">
                  <AlertCircle size={14} />
                  <span>{error}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit button */}
          <motion.button
            type="submit"
            className="login-submit"
            disabled={isSubmitting}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.985 }}
          >
            {isSubmitting ? (
              <div className="login-spinner" />
            ) : (
              <>
                <span className="login-submit-text">Acessar Plataforma</span>
                <div className="login-submit-icon">
                  <ArrowRight size={16} />
                </div>
              </>
            )}
          </motion.button>
        </motion.form>

        {/* Footer */}
        <motion.div
          className="login-footer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <div className="login-divider">
            <span>Acesso Restrito</span>
          </div>
          <p className="login-copyright">© {new Date().getFullYear()} Agência LINE · Powered by Silicon Valley Design</p>
        </motion.div>
      </motion.div>

      <style>{`
        .login-page {
          --login-primary: #E31837;
          --login-primary-dark: #B2122B;
          --login-bg: #050507;
          --login-surface: rgba(13, 13, 17, 0.7);
          --login-border: rgba(255, 255, 255, 0.08);
          --login-text: #fafafa;
          --login-text-muted: #a1a1aa;
          
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          min-height: 100dvh;
          padding: 24px;
          overflow: hidden;
          background: var(--login-bg);
          font-family: 'Inter', sans-serif;
        }

        /* ─── Animated Background ──────────────────────────────────────── */
        .login-bg {
          position: absolute;
          inset: 0;
          overflow: hidden;
          z-index: 0;
        }
        .login-bg-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(120px);
          opacity: 0.3;
          animation: orbFloat 25s ease-in-out infinite;
        }
        .login-bg-orb--1 {
          width: 700px;
          height: 700px;
          background: radial-gradient(circle, var(--login-primary) 0%, transparent 70%);
          top: -20%;
          left: -10%;
          animation-duration: 28s;
        }
        .login-bg-orb--2 {
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, #f97316 0%, transparent 70%);
          bottom: -25%;
          right: -10%;
          animation-delay: -10s;
          animation-duration: 22s;
          opacity: 0.15;
        }
        .login-bg-orb--3 {
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, var(--login-primary) 0%, transparent 70%);
          top: 40%;
          left: 55%;
          animation-delay: -15s;
          animation-duration: 30s;
          opacity: 0.1;
        }
        @keyframes orbFloat {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(50px, -60px) scale(1.1); }
          66% { transform: translate(-30px, 40px) scale(0.9); }
        }
        .login-bg-grid {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
          background-size: 64px 64px;
          mask-image: radial-gradient(ellipse at center, black 30%, transparent 80%);
          -webkit-mask-image: radial-gradient(ellipse at center, black 30%, transparent 80%);
        }
        .login-bg-noise {
          position: absolute;
          inset: 0;
          opacity: 0.04;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          pointer-events: none;
        }

        /* ─── Card ─────────────────────────────────────────────────────── */
        .login-card {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 440px;
          padding: 56px 48px 48px;
          background: var(--login-surface);
          backdrop-filter: blur(40px) saturate(200%);
          -webkit-backdrop-filter: blur(40px) saturate(200%);
          border: 1px solid var(--login-border);
          border-radius: 28px;
          box-shadow: 
            0 0 0 1px rgba(255, 255, 255, 0.03),
            0 24px 80px -12px rgba(0, 0, 0, 0.8),
            0 0 60px -10px rgba(227, 24, 55, 0.12);
        }
        .login-card-glow {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 140px;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--login-primary), transparent);
          box-shadow: 0 0 20px 2px var(--login-primary);
          opacity: 0.5;
        }

        /* ─── Brand ────────────────────────────────────────────────────── */
        .login-brand {
          text-align: center;
          margin-bottom: 44px;
        }
        .login-logo-container {
          display: flex;
          justify-content: center;
          margin-bottom: 24px;
        }
        .login-logo-wrapper {
          width: 64px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(145deg, #16161a, #09090b);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 18px;
          color: var(--login-primary);
          box-shadow: 
            0 8px 32px -8px rgba(0, 0, 0, 0.5),
            inset 0 0 10px rgba(227, 24, 55, 0.1);
          position: relative;
        }
        .login-logo-svg {
          width: 32px;
          height: 32px;
          filter: drop-shadow(0 0 8px rgba(227, 24, 55, 0.3));
        }
        .login-title {
          font-family: 'Outfit', sans-serif;
          font-size: 28px;
          font-weight: 800;
          color: #fafafa;
          letter-spacing: -0.04em;
          margin: 0;
          line-height: 1.1;
        }
        .login-subtitle {
          font-size: 13px;
          color: var(--login-text-muted);
          margin-top: 8px;
          font-weight: 400;
          letter-spacing: 0.01em;
          opacity: 0.8;
        }

        /* ─── Form ─────────────────────────────────────────────────────── */
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .login-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .login-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          font-weight: 600;
          color: var(--login-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          transition: color 0.2s;
        }
        .login-field--focused .login-label {
          color: var(--login-primary);
        }
        .login-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        .login-input {
          width: 100%;
          padding: 14px 16px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 14px;
          color: #fafafa;
          font-size: 14px;
          font-family: inherit;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          outline: none;
        }
        .login-input::placeholder {
          color: rgba(161, 161, 170, 0.25);
        }
        .login-field--focused .login-input {
          border-color: rgba(227, 24, 55, 0.4);
          background: rgba(227, 24, 55, 0.02);
          box-shadow: 0 0 0 4px rgba(227, 24, 55, 0.06);
        }
        .login-field--filled .login-input {
          background: rgba(255, 255, 255, 0.04);
          border-color: rgba(255, 255, 255, 0.1);
        }
        .login-input:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        /* ─── Toggle PW ────────────────────────────────────────────────── */
        .login-toggle-pw {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: rgba(161, 161, 170, 0.4);
          cursor: pointer;
          padding: 6px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        .login-toggle-pw:hover {
          color: #fafafa;
          background: rgba(255, 255, 255, 0.05);
        }

        /* ─── Error ────────────────────────────────────────────────────── */
        .login-error {
          overflow: hidden;
        }
        .login-error-content {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          background: rgba(227, 24, 55, 0.08);
          border: 1px solid rgba(227, 24, 55, 0.15);
          border-radius: 12px;
          color: #fecaca;
          font-size: 13px;
        }
        .login-error-content svg {
          flex-shrink: 0;
          color: var(--login-primary);
        }

        /* ─── Submit ───────────────────────────────────────────────────── */
        .login-submit {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          width: 100%;
          padding: 15px 24px;
          margin-top: 10px;
          background: var(--login-primary);
          border: none;
          border-radius: 14px;
          color: white;
          font-size: 15px;
          font-weight: 700;
          font-family: inherit;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
          overflow: hidden;
          letter-spacing: -0.01em;
          box-shadow: 0 4px 20px -4px rgba(227, 24, 55, 0.4);
        }
        .login-submit::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.2), transparent 60%);
          opacity: 0;
          transition: opacity 0.3s;
        }
        .login-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          background: var(--login-primary-dark);
          box-shadow: 0 8px 30px -4px rgba(227, 24, 55, 0.5);
        }
        .login-submit:hover:not(:disabled)::before {
          opacity: 1;
        }
        .login-submit:active:not(:disabled) {
          transform: translateY(1px);
        }
        .login-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          filter: grayscale(0.5);
        }
        .login-submit-icon {
          display: flex;
          transition: transform 0.3s ease;
        }
        .login-submit:hover:not(:disabled) .login-submit-icon {
          transform: translateX(4px);
        }

        /* ─── Spinner ──────────────────────────────────────────────────── */
        .login-spinner {
          width: 22px;
          height: 22px;
          border: 2.5px solid rgba(255, 255, 255, 0.2);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s cubic-bezier(0.6, 0.2, 0.1, 1) infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* ─── Footer ──────────────────────────────────────────────────── */
        .login-footer {
          margin-top: 40px;
          text-align: center;
        }
        .login-divider {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
        }
        .login-divider::before,
        .login-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: rgba(255, 255, 255, 0.05);
        }
        .login-divider span {
          padding: 0 16px;
          font-size: 11px;
          color: rgba(161, 161, 170, 0.35);
          white-space: nowrap;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          font-weight: 600;
        }
        .login-copyright {
          font-size: 11px;
          color: rgba(161, 161, 170, 0.2);
          margin: 0;
          letter-spacing: 0.02em;
        }

        /* ─── Responsive ───────────────────────────────────────────────── */
        @media (max-width: 480px) {
          .login-card {
            padding: 44px 28px 36px;
            border-radius: 24px;
          }
          .login-title {
            font-size: 24px;
          }
          .login-submit {
            padding: 13px 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
