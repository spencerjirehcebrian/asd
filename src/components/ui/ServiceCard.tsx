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

export const ServiceCard: React.FC<ServiceCardProps> = ({ 
  service, 
  isHighlighted = false, 
  isDimmed = false,
  shouldPulse = false
}) => {
  const handleClick = (): void => {
    window.open(service.url, '_blank', 'noopener,noreferrer');
  };

  // Get the icon component with fallback
  const IconComponent = iconMap[service.icon as keyof typeof iconMap] || Server;

  // Build dynamic classes based on search state
  const baseClasses = "group bg-zinc-900/40 backdrop-blur-sm border border-zinc-800/30 rounded-lg cursor-pointer p-4 w-full h-32 md:h-36 min-h-[128px] md:min-h-[144px] transition-all duration-300 ease-out hover:scale-[1.02] hover:bg-zinc-800/50";
  
  const searchClasses = isHighlighted 
    ? "border-emerald-400/60 bg-emerald-900/20 shadow-lg shadow-emerald-500/10" 
    : isDimmed 
      ? "opacity-30 scale-95" 
      : "";
  
  const pulseClasses = shouldPulse && isHighlighted 
    ? "animate-pulse" 
    : "";

  return (
    <div 
      className={`${baseClasses} ${searchClasses} ${pulseClasses}`}
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