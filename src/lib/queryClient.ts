import { QueryClient } from '@tanstack/react-query';

// Instância global do React Query configurada para o padrão Stale-while-revalidate
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Dados ficam "frescos" por 5 minutos (não refaz fetch)
      gcTime: 1000 * 60 * 30, // Mantém no cache por 30 minutos em background
      refetchOnWindowFocus: true, // Atualiza se o usuário voltar para a aba
      retry: 2, // Tenta novamente 2 vezes se falhar
    },
  },
});
