'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

export default function HomePage() {
  const [nfcCode, setNfcCode] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const processingRef = useRef(false);

  // Reloj
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    inputRef.current?.focus();
    return () => clearInterval(interval);
  }, []);

  // Foco automático
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleNfcInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setNfcCode(value);
    // Auto-submit si tiene longitud de tarjeta estándar (8+ caracteres)
    if (value.length >= 8) {
      handleSubmit(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit(nfcCode);
    }
  };

  const handleSubmit = async (code: string) => {
    if (processingRef.current || !code.trim()) return;

    setProcessing(true);
    processingRef.current = true;
    setMessage('');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const res = await fetch(`${apiUrl}/nfc/lectura`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigoNfc: code.trim() }),
      });

      const result = await res.json();

      if (result.success) {
        const horaActual = new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true });
        const tipoTexto = result.tipo === 'salida' ? 'Salida' : 'Entrada';
        const nombre = result.empleado || code.trim();
        setMessage(`✓ ${tipoTexto} registrada — ${nombre} a las ${horaActual}`);

        setTimeout(() => {
          resetForm();
        }, 4000);
      } else {
        const msgFinal = result.message || 'Error en el servidor';
        setMessage(`✕ ${msgFinal}`);
        setNfcCode('');
        setTimeout(() => resetForm(), 5000);
      }
    } catch (error) {
      setMessage('❌ Error de conexión con el servidor.');
      setNfcCode('');
      setTimeout(() => resetForm(), 5000);
    }

    setProcessing(false);
    processingRef.current = false;
  };

  const resetForm = () => {
    setNfcCode('');
    setMessage('');
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  return (
    <div className={styles.container}>
      {/* Panel Izquierdo - Información y Reloj */}
      <div className={styles.infoPanel}>
        <div className={styles.defaultViewContent}>
          <div className={styles.brand}>
            <h1>SIRAP</h1>
            <p>Sistema de Registro de Asistencia</p>
          </div>

          <div className={styles.clockContainer}>
            <div className={styles.timeWrapper}>
              <div className={styles.time}>
                {currentTime.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true }).split(' ')[0]}
              </div>
              <div className={styles.ampm}>
                {currentTime.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true }).split(' ')[1]}
              </div>
            </div>

            <div className={styles.date}>
              {currentTime.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>

          <div className={styles.infoFooter}>
            <p>© 2026 SIRAP. Todos los derechos reservados por Ariel Guevara Balderas y José Manuel Villa Aguillón.</p>
          </div>
        </div>
      </div>

      {/* Panel Derecho - Acción NFC */}
      <div className={styles.actionPanel}>
        <div className={styles.scanSection}>
          <div className={styles.scannerVisual}>
            <div className={styles.scannerCircle}></div>
            <div className={styles.scannerIcon}>
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
              </svg>
            </div>
          </div>
          
          <div className={styles.scanInstructions}>
            <h2>Bienvenido</h2>
            <p>Acerque su tarjeta NFC al lector para registrar su entrada o salida.</p>
          </div>

          <div className={styles.inputWrapper}>
            <input
              ref={inputRef}
              type="text"
              className={`${styles.nfcInput} ${message ? (message.includes('✓') ? styles.inputSuccess : styles.inputError) : ''}`}
              placeholder={message ? "" : "Esperando lectura..."}
              value={message ? "" : nfcCode}
              onChange={handleNfcInput}
              onKeyDown={handleKeyDown}
              disabled={processing}
              autoFocus
              autoComplete="off"
              name="nfc-key-reader"
              id="nfc-key-reader"
            />
            {message && (
              <div className={`${styles.messageOverlay} ${message.includes('✓') ? styles.textSuccess : styles.textError}`} onClick={() => resetForm()}>
                {message}
              </div>
            )}
            {processing && <div className={styles.inputLoader}></div>}
          </div>
        </div>

        <div className={styles.adminAccess}>
          <Link href="/login" className={styles.adminLink} title="Acceso Administrativo">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
