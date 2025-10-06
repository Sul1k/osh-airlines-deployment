import { useCallback } from 'react';
import { toast } from 'sonner';

export function useToast() {
  const success = useCallback((message: string, description?: string) => {
    toast.success(message, { description });
  }, []);

  const error = useCallback((message: string, description?: string) => {
    toast.error(message, { description });
  }, []);

  const warning = useCallback((message: string, description?: string) => {
    toast.warning(message, { description });
  }, []);

  const info = useCallback((message: string, description?: string) => {
    toast.info(message, { description });
  }, []);

  return {
    success,
    error,
    warning,
    info,
  };
}
