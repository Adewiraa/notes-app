'use client';

import React, { useState } from 'react';
import { useNotes } from '@/context/NotesContext';

export const LoginScreen: React.FC = () => {
  const { login, register, isLoadingUser } = useNotes();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password'); // default Laravel seeder password
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg('Email wajib diisi.');
      return;
    }
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      if (isRegisterMode) {
        if (!name) {
          setErrorMsg('Nama wajib diisi.');
          setIsSubmitting(false);
          return;
        }
        await register(name, email, password);
      } else {
        await login(email, password);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillQuickTest = () => {
    setEmail('test@example.com');
    setPassword('password');
    setName('Test User');
    setIsRegisterMode(false);
    setErrorMsg('');
  };

  if (isLoadingUser) {
    return (
      <div style={styles.loadingScreen}>
        <div style={styles.spinner}></div>
        <p style={{ marginTop: '16px', fontFamily: 'var(--font-title)' }}>Memuat sistem...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.glowBg}></div>
      <div style={styles.card} className="glass animate-scale-in">
        <div style={styles.header}>
          <div style={styles.logo}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15.5 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-8.5" />
              <path d="M17.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z" />
            </svg>
          </div>
          <h1 style={styles.title}>KeepClean</h1>
          <p style={styles.subtitle}>
            {isRegisterMode ? 'Daftar akun baru notes Anda' : 'Kelola catatan harian Anda secara terpusat'}
          </p>
        </div>

        {errorMsg && <div style={styles.errorAlert}>{errorMsg}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          {isRegisterMode && (
            <div style={styles.inputGroup}>
              <label style={styles.label}>NAMA LENGKAP</label>
              <input
                type="text"
                placeholder="Masukkan nama Anda"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={styles.input}
                required
              />
            </div>
          )}

          <div style={styles.inputGroup}>
            <label style={styles.label}>EMAIL AKUN</label>
            <input
              type="email"
              placeholder="nama@perusahaan.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={styles.label}>KATA SANDI</label>
              {!isRegisterMode && (
                <span style={styles.forgot}>Default: password</span>
              )}
            </div>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <button type="submit" disabled={isSubmitting} style={styles.submitBtn}>
            {isSubmitting ? (
              <span style={styles.spinnerMini}></span>
            ) : isRegisterMode ? (
              'Daftar Sekarang'
            ) : (
              'Masuk Akun'
            )}
          </button>
        </form>

        <div style={styles.divider}>
          <span style={styles.dividerText}>atau gunakan</span>
        </div>

        <button onClick={fillQuickTest} style={styles.quickFillBtn}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
          </svg>
          Quick Fill Akun Demo (Laravel Seeder)
        </button>

        <div style={styles.footer}>
          <p style={styles.footerText}>
            {isRegisterMode ? 'Sudah punya akun?' : 'Belum memiliki akun?'}
            <button
              onClick={() => {
                setIsRegisterMode(!isRegisterMode);
                setErrorMsg('');
              }}
              style={styles.toggleBtn}
            >
              {isRegisterMode ? 'Masuk' : 'Daftar Akun'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    width: '100%',
    padding: '24px',
    position: 'relative',
    overflow: 'hidden',
  },
  glowBg: {
    position: 'absolute',
    width: '400px',
    height: '400px',
    borderRadius: '999px',
    background: 'radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)',
    top: '30%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: -1,
  },
  card: {
    width: '100%',
    maxWidth: '420px',
    padding: '36px 32px',
    borderRadius: '24px',
    boxShadow: 'var(--shadow)',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '8px',
  },
  logo: {
    width: '54px',
    height: '54px',
    borderRadius: '16px',
    backgroundColor: 'var(--accent-light)',
    color: 'var(--accent)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '8px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: 'var(--foreground)',
  },
  subtitle: {
    fontSize: '14px',
    color: 'var(--muted)',
    lineHeight: '1.4',
  },
  errorAlert: {
    padding: '12px 16px',
    borderRadius: '12px',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    color: 'var(--danger)',
    fontSize: '13px',
    fontWeight: '500',
    border: '1px solid rgba(239, 68, 68, 0.2)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '11px',
    fontWeight: '700',
    color: 'var(--muted)',
    letterSpacing: '0.05em',
  },
  input: {
    padding: '12px 16px',
    borderRadius: '12px',
    border: '1px solid var(--card-border)',
    backgroundColor: 'var(--background)',
    color: 'var(--foreground)',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.2s ease',
    fontFamily: 'inherit',
  },
  forgot: {
    fontSize: '11px',
    color: 'var(--muted)',
  },
  submitBtn: {
    padding: '14px',
    borderRadius: '12px',
    backgroundColor: 'var(--accent)',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: '600',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    marginTop: '6px',
    boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    textAlign: 'center',
    color: 'var(--muted)',
    fontSize: '12px',
    margin: '4px 0',
  },
  dividerText: {
    padding: '0 10px',
    width: '100%',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickFillBtn: {
    padding: '12px',
    borderRadius: '12px',
    backgroundColor: 'transparent',
    color: 'var(--accent)',
    fontSize: '13px',
    fontWeight: '600',
    border: '1.5px dashed var(--accent)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.2s ease',
  },
  footer: {
    textAlign: 'center',
    marginTop: '8px',
  },
  footerText: {
    fontSize: '13px',
    color: 'var(--muted)',
  },
  toggleBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--accent)',
    fontWeight: '600',
    cursor: 'pointer',
    marginLeft: '6px',
    fontFamily: 'inherit',
    fontSize: '13px',
  },
  loadingScreen: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    width: '100%',
    backgroundColor: 'var(--background)',
    color: 'var(--foreground)',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid var(--accent-light)',
    borderTop: '4px solid var(--accent)',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  spinnerMini: {
    width: '18px',
    height: '18px',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderTop: '2px solid #ffffff',
    borderRadius: '50%',
    animation: 'spin 0.6s linear infinite',
  },
};
