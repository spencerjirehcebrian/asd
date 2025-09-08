import { useState, useEffect, useCallback } from 'react';
import yaml from 'js-yaml';
import { Service, ServicesConfig, UseServicesResult } from '../types';
import { cacheManager } from '../utils/cacheManager';
import { githubApi } from '../utils/githubApi';

export const useServices = (): UseServicesResult => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load services from GitHub API with caching
   */
  const loadFromGitHub = useCallback(async (cachedEtag?: string): Promise<ServicesConfig | null> => {
    try {
      const result = await githubApi.fetchConfig(cachedEtag);
      
      // Cache the successful response
      cacheManager.set(result.data, 'github_api', result.etag);
      
      return result.data;
    } catch (err) {
      if (err instanceof Error && err.message === 'NOT_MODIFIED') {
        // Content hasn't changed, cached version is still valid
        return null;
      }
      
      console.warn('GitHub API failed:', err);
      throw err;
    }
  }, []);

  /**
   * Load services from local YAML file
   */
  const loadFromLocalYaml = useCallback(async (): Promise<ServicesConfig> => {
    const response = await fetch('/config/services.yml');
    if (!response.ok) {
      throw new Error('Failed to fetch local YAML configuration');
    }
    
    const yamlText = await response.text();
    const parsed = yaml.load(yamlText) as ServicesConfig;
    
    if (!parsed || !parsed.services) {
      throw new Error('Invalid YAML configuration structure');
    }
    
    // Cache the local YAML response
    cacheManager.set(parsed, 'local_yaml');
    
    return parsed;
  }, []);

  /**
   * Load services from local JSON file (final fallback)
   */
  const loadFromLocalJson = useCallback(async (): Promise<ServicesConfig> => {
    const response = await fetch('/config/services.json');
    if (!response.ok) {
      throw new Error('Failed to fetch local JSON configuration');
    }
    
    const data: ServicesConfig = await response.json();
    
    if (!data || !data.services) {
      throw new Error('Invalid JSON configuration structure');
    }
    
    // Cache the local JSON response
    cacheManager.set(data, 'local_json');
    
    return data;
  }, []);

  /**
   * Main service loading function with comprehensive fallback chain
   */
  const fetchServices = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      // Step 1: Check cache first
      const cachedData = cacheManager.get();
      if (cachedData) {
        setServices(cachedData.data.services);
        setLoading(false);
        
        // If cache is near expiry, refresh in background
        if (cacheManager.isNearExpiry()) {
          try {
            const refreshedData = await loadFromGitHub(cachedData.etag);
            if (refreshedData) {
              setServices(refreshedData.services);
            }
          } catch (err) {
            console.warn('Background refresh failed:', err);
          }
        }
        
        return;
      }

      // Step 2: Try GitHub API
      try {
        const githubData = await loadFromGitHub();
        if (githubData) {
          setServices(githubData.services);
          setLoading(false);
          return;
        }
      } catch (githubError) {
        console.warn('GitHub API unavailable, trying local files:', githubError);
      }

      // Step 3: Try local YAML file
      try {
        const yamlData = await loadFromLocalYaml();
        setServices(yamlData.services);
        setLoading(false);
        return;
      } catch (yamlError) {
        console.warn('Local YAML unavailable, trying JSON fallback:', yamlError);
      }

      // Step 4: Try local JSON file (final fallback)
      try {
        const jsonData = await loadFromLocalJson();
        setServices(jsonData.services);
        setLoading(false);
        return;
      } catch (jsonError) {
        console.error('All configuration sources failed:', jsonError);
        throw new Error('Unable to load services configuration from any source');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      setLoading(false);
    }
  }, [loadFromGitHub, loadFromLocalYaml, loadFromLocalJson]);

  /**
   * Manual refresh function to clear cache and reload
   */
  const refresh = useCallback(async (): Promise<void> => {
    cacheManager.clear();
    await fetchServices();
  }, [fetchServices]);

  // Initial load
  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  // Expose refresh function in development
  useEffect(() => {
    if (import.meta.env.DEV) {
      (window as any).refreshServices = refresh;
      (window as any).clearServicesCache = () => cacheManager.clear();
      (window as any).getServicesCacheStats = () => cacheManager.getStats();
    }
  }, [refresh]);

  return { services, loading, error };
};