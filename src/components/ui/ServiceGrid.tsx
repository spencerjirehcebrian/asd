import { ServiceCard } from './ServiceCard';
import { ServiceGridProps } from '../../types';

export const ServiceGrid: React.FC<ServiceGridProps> = ({ services, searchState }) => {
  const servicesToDisplay = searchState?.filteredServices || services;
  const isSearching = searchState?.isSearching || false;
  const shouldPulseHighlighted = searchState?.shouldPulseHighlighted || false;

  return (
    <div className="flex justify-center min-h-screen py-8">
      <div className="w-full max-w-7xl px-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 lg:gap-8 justify-items-center">
          {services.map((service) => {
            const isHighlighted = isSearching && servicesToDisplay.includes(service);
            const isDimmed = isSearching && !servicesToDisplay.includes(service);
            const shouldPulse = shouldPulseHighlighted && isHighlighted;
            
            return (
              <ServiceCard 
                key={service.id} 
                service={service}
                isHighlighted={isHighlighted}
                isDimmed={isDimmed}
                shouldPulse={shouldPulse}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};