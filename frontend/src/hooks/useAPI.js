import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for data fetching with loading and error states
 * @param {function} asyncFunction - Async function that returns API response
 * @param {array} dependencies - Dependency array for useEffect (default: [])
 * @returns {object} - { data, loading, error, refetch }
 */
export const useAPI = (asyncFunction, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await asyncFunction();
      setData(result.data);
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [asyncFunction]);

  useEffect(() => {
    fetchData();
  }, dependencies);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
};

/**
 * Custom hook for managing form submission to API
 * @param {function} asyncFunction - Async function that handles the submission
 * @returns {object} - { loading, error, execute }
 */
export const useAPISubmit = (asyncFunction) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await asyncFunction(...args);
      return result.data;
    } catch (err) {
      setError(err.message || 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [asyncFunction]);

  return { loading, error, execute };
};
