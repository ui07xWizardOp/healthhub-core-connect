
import { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";

type TableName = keyof Database['public']['Tables'];

/**
 * A custom hook to handle Supabase queries with proper TypeScript support
 */
export function useSupabaseQuery<T = any>(
  tableName: TableName,
  options: {
    select?: string;
    filters?: (query: any) => any;
    enabled?: boolean;
  } = {}
) {
  const [data, setData] = useState<T[] | null>(null);
  const [count, setCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const { select = '*', filters, enabled = true } = options;

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Start building the query
      let query = supabase.from(tableName).select(select);

      // Apply any filters if provided
      if (filters) {
        query = filters(query);
      }

      // Execute the query
      const { data: result, error: queryError, count: queryCount } = await query;

      if (queryError) {
        throw queryError;
      }

      setData(result as T[]);
      if (queryCount !== null) {
        setCount(queryCount);
      }
    } catch (err: any) {
      setError(err);
      console.error(`Error fetching data from ${tableName}:`, err.message);
      toast({
        title: `Error fetching data from ${tableName}`,
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [tableName, select, toast, enabled, filters]);

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    fetchData();
  }, [fetchData, enabled]);

  // Return the refetch function along with the data
  return { data, count, isLoading, error, refetch: fetchData };
}

/**
 * A custom hook to fetch a single row from a Supabase table by ID
 */
export function useSupabaseRecord<T = any>(
  tableName: TableName,
  id: string | number | null | undefined,
  options: {
    idField?: string;
    select?: string;
    enabled?: boolean;
  } = {}
) {
  const { idField = 'id', select = '*', enabled = true } = options;
  const [record, setRecord] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const fetchRecord = useCallback(async () => {
    if (!id || !enabled) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Break down the query into separate steps using any type to avoid type recursion
      const query = supabase.from(tableName as any);
      const { data, error: queryError } = await query
        .select(select)
        .eq(idField, id)
        .maybeSingle();
      
      if (queryError) {
        throw queryError;
      }

      setRecord(data as T);
    } catch (err: any) {
      setError(err);
      console.error(`Error fetching record from ${tableName}:`, err.message);
      toast({
        title: `Error fetching record from ${tableName}`,
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [tableName, id, idField, select, toast, enabled]);

  useEffect(() => {
    fetchRecord();
  }, [fetchRecord]);

  return { record, isLoading, error, refetch: fetchRecord };
}
