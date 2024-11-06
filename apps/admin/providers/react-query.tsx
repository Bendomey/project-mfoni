"use client"
/**
 * @module ReactQueryProvider
 */
import { PropsWithChildren, ReactElement } from 'react';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient();

/**
 *
 * @param {ReactElement} children - Children components
 *
 * @returns {ReactElement} - Jsx containerised with query provider
 */
export const ReactQueryProvider = ({ children }: PropsWithChildren) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} position="right" />
    </QueryClientProvider>
  );
};
