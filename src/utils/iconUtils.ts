import { 
  Sun, 
  Moon, 
  Star, 
  Heart, 
  Flower,
  Coffee,
  Gem,
  Leaf,
  Sparkles,
  Zap,
  Cloud,
  Snowflake,
  Flame,
  TreePine,
  Cherry,
  Feather,
  Music,
  Palette,
  Compass,
  Anchor,
  Crown,
  Clover,
  Flower2,
  Gift,
  Magnet,
  Scissors,
  Shell,
  Umbrella,
  Waves,
  Wind,
  Apple,
  Bird,
  Fish,
  Key,
  Mountain,
  Puzzle,
  Sailboat,
  Trophy,
  Wand2
} from 'lucide-react';

// Aesthetic icon mapping for randomization
export const aestheticIcons = [
  Sun,
  Moon,
  Star,
  Heart,
  Flower,
  Coffee,
  Gem,
  Leaf,
  Sparkles,
  Zap,
  Cloud,
  Snowflake,
  Flame,
  TreePine,
  Cherry,
  Feather,
  Music,
  Palette,
  Compass,
  Anchor,
  Crown,
  Clover,
  Flower2,
  Gift,
  Magnet,
  Scissors,
  Shell,
  Umbrella,
  Waves,
  Wind,
  Apple,
  Bird,
  Fish,
  Key,
  Mountain,
  Puzzle,
  Sailboat,
  Trophy,
  Wand2
] as const;

// Type for aesthetic icon names
export type AestheticIconName = 
  | 'Sun'
  | 'Moon'
  | 'Star'
  | 'Heart'
  | 'Flower'
  | 'Coffee'
  | 'Gem'
  | 'Leaf'
  | 'Sparkles'
  | 'Zap'
  | 'Cloud'
  | 'Snowflake'
  | 'Flame'
  | 'TreePine'
  | 'Cherry'
  | 'Feather'
  | 'Music'
  | 'Palette'
  | 'Compass'
  | 'Anchor'
  | 'Crown'
  | 'Clover'
  | 'Flower2'
  | 'Gift'
  | 'Magnet'
  | 'Scissors'
  | 'Shell'
  | 'Umbrella'
  | 'Waves'
  | 'Wind'
  | 'Apple'
  | 'Bird'
  | 'Fish'
  | 'Key'
  | 'Mountain'
  | 'Puzzle'
  | 'Sailboat'
  | 'Trophy'
  | 'Wand2';

/**
 * Simple hash function to create a pseudo-random number from a string
 * This ensures the same service ID will get the same icon during a session
 * but will be different across page refreshes due to the timestamp seed
 */
function simpleHash(str: string, seed: number = 0): number {
  let hash = seed;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Get a randomized aesthetic icon for a service
 * Uses the service ID combined with a session timestamp to ensure
 * consistency during a session but randomization on page refresh
 */
export function getRandomIconForService(serviceId: string): typeof aestheticIcons[number] {
  // Get or create a session timestamp that changes on page refresh
  let sessionSeed = sessionStorage.getItem('asd_icon_session_seed');
  if (!sessionSeed) {
    sessionSeed = Date.now().toString();
    sessionStorage.setItem('asd_icon_session_seed', sessionSeed);
  }

  // Create a hash from the service ID and session seed
  const hash = simpleHash(serviceId + sessionSeed);
  const iconIndex = hash % aestheticIcons.length;
  
  return aestheticIcons[iconIndex];
}

/**
 * Force regenerate all icons (useful for testing)
 */
export function regenerateIcons(): void {
  sessionStorage.removeItem('asd_icon_session_seed');
}

/**
 * Test function to show what icon would be assigned to a service
 * Useful for debugging in browser console
 */
export function testIconAssignment(serviceId: string): string {
  const iconComponent = getRandomIconForService(serviceId);
  return iconComponent.name || 'Unknown';
}

// Expose utilities to window in development mode
if (typeof window !== 'undefined' && import.meta.env?.DEV) {
  (window as any).regenerateIcons = regenerateIcons;
  (window as any).testIconAssignment = testIconAssignment;
}