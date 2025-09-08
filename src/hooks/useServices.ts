import { useState, useEffect } from 'react';
import { Service, ServicesConfig, UseServicesResult } from '../types';

export const useServices = (): UseServicesResult => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async (): Promise<void> => {
      try {
        const response = await fetch('/config/services.json');
        if (!response.ok) {
          throw new Error('Failed to fetch services configuration');
        }
        const data: ServicesConfig = await response.json();
        setServices(data.services || []);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  return { services, loading, error };
};