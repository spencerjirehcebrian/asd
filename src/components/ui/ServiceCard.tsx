import { ServiceCardProps } from '../../types';
import { getRandomIconForService } from '../../utils/iconUtils';


export const ServiceCard: React.FC<ServiceCardProps> = ({ 
  service, 
  isHighlighted = false, 
  isDimmed = false,
  shouldPulse = false,
  isFocused = false,
  shouldShowShimmer = false,
  onSettingsClick
}) => {
  const handleClick = (): void => {
    // Handle settings service click
    if (service.id === '__settings__') {
      if (onSettingsClick) {
        onSettingsClick();
      }
      return;
    }
    
    // Only open URL if it exists and is not empty
    if (service.url && service.url.trim() !== '') {
      window.open(service.url, '_blank', 'noopener,noreferrer');
    }
  };

  // Get the randomized aesthetic icon for this service
  const IconComponent = getRandomIconForService(service.id);

  // Build dynamic classes based on search state
  const baseClasses = "group glass-luxury cursor-pointer p-6 w-full h-40 md:h-44 min-h-[160px] md:min-h-[176px] rounded-xl card-zen-hover inner-shimmer";
  
  const searchClasses = isHighlighted 
    ? `search-highlight-enhanced ${shouldShowShimmer ? 'search-highlight-shimmer' : ''} search-highlight-glow` 
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
        <div className="flex-grow">
          <p className="text-sm text-zinc-400 group-hover:text-zinc-300 transition-colors duration-300 leading-relaxed line-clamp-2">
            {service.description}
          </p>
        </div>
      </div>
    </div>
  );
};