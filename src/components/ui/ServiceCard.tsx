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
  shouldPulse = false,
  isFocused = false
}) => {
  const handleClick = (): void => {
    window.open(service.url, '_blank', 'noopener,noreferrer');
  };

  // Get the icon component with fallback
  const IconComponent = iconMap[service.icon as keyof typeof iconMap] || Server;

  // Build dynamic classes based on search state
  const baseClasses = "group glass-luxury cursor-pointer p-6 w-full h-40 md:h-44 min-h-[160px] md:min-h-[176px] rounded-xl card-zen-hover inner-shimmer";
  
  const searchClasses = isHighlighted 
    ? "search-highlight-enhanced search-highlight-shimmer search-highlight-glow" 
    : isDimmed 
      ? "opacity-30" 
      : "";
  
  const pulseClasses = shouldPulse && isHighlighted 
    ? "animate-pulse" 
    : "";
  
  const focusClasses = isFocused 
    ? "keyboard-focused" 
    : "";

  return (
    <div 
      className={`${baseClasses} ${searchClasses} ${pulseClasses} ${focusClasses}`}
      onClick={handleClick}
      tabIndex={-1}
    >
      {/* Content */}
      <div className="flex flex-col h-full content-float">
        {/* Icon */}
        <div className="mb-3">
          <IconComponent 
            className="w-6 h-6 text-zinc-400 group-hover:text-zinc-300 transition-colors duration-300" 
          />
        </div>
        
        {/* Title */}
        <h3 className="text-base font-semibold text-zinc-100 mb-2 group-hover:text-white transition-colors duration-300 line-clamp-1">
          {service.name}
        </h3>
        
        {/* Description */}
        <p className="text-sm text-zinc-400 group-hover:text-zinc-300 transition-colors duration-300 line-clamp-2 flex-grow leading-relaxed">
          {service.description}
        </p>
      </div>
    </div>
  );
};