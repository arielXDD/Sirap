'use client';

import { useState } from 'react';
import styles from './page.module.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al procesar la solicitud');
      }

      setMessage(data.message || 'Se ha enviado un correo con las instrucciones.');
    } catch (err: any) {
      setError(err.message || 'Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.background}></div>
      
      <div className={styles.loginBox}>
        <div className={styles.header}>
          <h1 className={styles.title}>SIRAP</h1>
          <p className={styles.subtitle}>Recuperar Contraseña</p>
        </div>

        {message ? (
          <div className={styles.success}>
            <p>{message}</p>
            <div className={styles.footer}>
              <a href="/login" className={styles.backLink}>
                Volver al inicio de sesión
              </a>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            <p className={styles.description}>
              Ingresa tu correo electrónico registrado y te enviaremos un enlace para restablecer tu contraseña.
            </p>

            {error && (
              <div className={styles.error}>
                {error}
              </div>
            )}

            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.label}>
                Correo Electrónico
              </label>
              <input
                type="email"
                id="email"
                className={styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                placeholder="ejemplo@correo.com"
              />
            </div>

            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? 'Enviando...' : 'Enviar instrucciones'}
            </button>

            <div className={styles.footer}>
              <a href="/login" className={styles.backLink}>
                ← Volver al inicio de sesión
              </a>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
