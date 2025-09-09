import { ServiceCard } from './ServiceCard';
import { ServiceGridProps } from '../../types';

export const ServiceGrid: React.FC<ServiceGridProps> = ({ services, searchState }) => {
  const servicesToDisplay = searchState?.filteredServices || services;
  const isSearching = searchState?.isSearching || false;
  const shouldPulseHighlighted = searchState?.shouldPulseHighlighted || false;
  const focusedService = searchState?.focusedService;
  const hasFocusedCard = !!focusedService;

  return (
    <div className="flex justify-center min-h-screen pt-24 pb-8 overflow-y-auto">
      <div className="w-full max-w-7xl px-12 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 lg:gap-4 justify-items-center">
          {services.map((service) => {
            const isHighlighted = isSearching && servicesToDisplay.some(s => s.id === service.id);
            const isDimmed = isSearching && !servicesToDisplay.some(s => s.id === service.id);
            const shouldPulse = shouldPulseHighlighted && isHighlighted;
            const isFocused = focusedService?.id === service.id;
            const shouldShowShimmer = isHighlighted && (!hasFocusedCard || isFocused);
            
            return (
              <ServiceCard 
                key={service.id} 
                service={service}
                isHighlighted={isHighlighted}
                isDimmed={isDimmed}
                shouldPulse={shouldPulse}
                isFocused={isFocused}
                shouldShowShimmer={shouldShowShimmer}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};