import { ServiceCard } from './ServiceCard';
import { ServiceGridProps } from '../../types';

export const ServiceGrid: React.FC<ServiceGridProps> = ({ services }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-3 p-4 w-full">
      {services.map((service) => (
        <ServiceCard 
          key={service.id} 
          service={service} 
        />
      ))}
    </div>
  );
};