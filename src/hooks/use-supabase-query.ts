
import { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    async function fetchData() {
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
    }

    fetchData();
  }, [tableName, select, toast, enabled]);

  return { data, count, isLoading, error };
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

  useEffect(() => {
    if (!id || !enabled) {
      setIsLoading(false);
      return;
    }

    async function fetchRecord() {
      setIsLoading(true);
      setError(null);

      try {
        // Using explicit typing and avoiding chained method calls to reduce type complexity
        const query = supabase
          .from(tableName)
          .select(select)
          .eq(idField, id);
          
        const response = await query.maybeSingle();

        if (response.error) {
          throw response.error;
        }

        setRecord(response.data as T);
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
    }

    fetchRecord();
  }, [tableName, id, idField, select, toast, enabled]);

  return { record, isLoading, error };
}
