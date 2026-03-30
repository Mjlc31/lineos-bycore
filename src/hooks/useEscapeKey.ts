import { useEffect } from 'react';

/**
 * Registra um listener de teclado para fechar modais/painéis com a tecla Escape.
 * @param handler Função a ser chamada quando Escape for pressionado
 * @param enabled Controla se o listener está ativo (padrão: true)
 */
function useEscapeKey(handler: () => void, enabled = true): void {
  useEffect(() => {
    if (!enabled) return;
    const listener = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handler();
    };
    document.addEventListener('keydown', listener);
    return () => document.removeEventListener('keydown', listener);
  }, [handler, enabled]);
}

export default useEscapeKey;
