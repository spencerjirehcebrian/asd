import { 
  Server,
  Database,
  Code,
  Monitor,
  Container,
  Folder,
  Play,
  Shield,
  Globe,
  Terminal,
  HardDrive,
  Network,
} from 'lucide-react';
import { ServiceCardProps } from '../../types';

// Icon mapping for type safety
const iconMap = {
  Server,
  Database,
  Code,
  Monitor,
  Container,
  Folder,
  Play,
  Shield,
  Globe,
  Terminal,
  HardDrive,
  Network,
} as const;

export const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => {
  const handleClick = (): void => {
    window.open(service.url, '_blank', 'noopener,noreferrer');
  };

  // Get the icon component with fallback
  const IconComponent = iconMap[service.icon as keyof typeof iconMap] || Server;

  return (
    <div 
      className="group bg-zinc-900/40 backdrop-blur-sm border border-zinc-800/30 rounded-lg cursor-pointer p-3 w-full h-28 min-h-[112px] transition-all duration-200 ease-out hover:scale-[1.02] hover:bg-zinc-800/50"
      onClick={handleClick}
    >
      {/* Content */}
      <div className="flex flex-col h-full">
        {/* Icon */}
        <div className="mb-2">
          <IconComponent 
            className="w-5 h-5 text-zinc-400 group-hover:text-zinc-300 transition-colors duration-200" 
          />
        </div>
        
        {/* Title */}
        <h3 className="text-sm font-semibold text-zinc-100 mb-1 group-hover:text-white transition-colors duration-200 line-clamp-1">
          {service.name}
        </h3>
        
        {/* Description */}
        <p className="text-xs text-zinc-400 group-hover:text-zinc-300 transition-colors duration-200 line-clamp-2 flex-grow">
          {service.description}
        </p>
      </div>
    </div>
  );
};