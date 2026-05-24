/**
 * useTransactions — Hook para o módulo Financeiro/DRE
 */
import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchTransactions, createTransaction as createTxDB,
  deleteTransaction as deleteTxDB, fetchFinancialSummary,
} from '../services';
import type { Transaction } from '../types';
import type { FinancialSummary } from '../services/transactionService';

export function useTransactions() {
  const queryClient = useQueryClient();

  const { data: transactions = [], isLoading: isTxLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: fetchTransactions,
  });

  const { data: summary = null, isLoading: isSummaryLoading } = useQuery({
    queryKey: ['financialSummary'],
    queryFn: fetchFinancialSummary,
  });

  const isLoading = isTxLoading || isSummaryLoading;

  const setTransactions = useCallback((updater: any) => {
    queryClient.setQueryData(['transactions'], (prev: any) => {
      const current = prev || [];
      return typeof updater === 'function' ? updater(current) : updater;
    });
  }, [queryClient]);

  const addTransaction = useCallback(async (tx: Omit<Transaction, 'id'>) => {
    const tempId = Date.now();
    const optimistic = { ...tx, id: tempId };
    setTransactions((prev: Transaction[]) => [optimistic, ...prev]);

    try {
      const saved = await createTxDB(tx);
      setTransactions((prev: Transaction[]) => prev.map(t => t.id === tempId ? saved : t));
      queryClient.invalidateQueries({ queryKey: ['financialSummary'] });
    } catch (err) {
      console.error('[useTransactions] addTransaction falhou:', err);
    }
  }, [setTransactions, queryClient]);

  const deleteTransaction = useCallback(async (id: number) => {
    setTransactions((prev: Transaction[]) => prev.filter(t => t.id !== id));
    try {
      await deleteTxDB(id);
      queryClient.invalidateQueries({ queryKey: ['financialSummary'] });
    } catch (err) {
      console.error('[useTransactions] deleteTransaction falhou:', err);
    }
  }, [setTransactions, queryClient]);

  return {
    transactions, setTransactions,
    summary,
    isLoading,
    addTransaction,
    deleteTransaction,
  };
}
