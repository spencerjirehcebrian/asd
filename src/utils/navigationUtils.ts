import { Service } from '../types';

export interface GridDimensions {
  columns: number;
  rows: number;
  totalItems: number;
}

export const getGridColumns = (): number => {
  if (typeof window === 'undefined') return 5;
  
  const width = window.innerWidth;
  if (width < 768) return 2; // md breakpoint
  if (width < 1024) return 3; // lg breakpoint  
  if (width < 1280) return 4; // xl breakpoint
  return 5; // xl and above
};

export const calculateGridDimensions = (itemCount: number): GridDimensions => {
  const columns = getGridColumns();
  const rows = Math.ceil(itemCount / columns);
  return {
    columns,
    rows,
    totalItems: itemCount
  };
};

export const getIndexFromPosition = (row: number, col: number, columns: number): number => {
  return row * columns + col;
};

export const getPositionFromIndex = (index: number, columns: number): { row: number; col: number } => {
  const row = Math.floor(index / columns);
  const col = index % columns;
  return { row, col };
};

export const getNextTabIndex = (
  currentIndex: number, 
  totalItems: number, 
  direction: 'forward' | 'backward'
): number => {
  if (totalItems === 0) return -1;
  
  if (direction === 'forward') {
    return (currentIndex + 1) % totalItems;
  } else {
    return currentIndex <= 0 ? totalItems - 1 : currentIndex - 1;
  }
};

export const getArrowNavigationIndex = (
  currentIndex: number,
  direction: 'up' | 'down' | 'left' | 'right',
  gridDimensions: GridDimensions
): number => {
  if (gridDimensions.totalItems === 0) return -1;
  
  const { row, col } = getPositionFromIndex(currentIndex, gridDimensions.columns);
  let newRow = row;
  let newCol = col;
  
  switch (direction) {
    case 'up':
      newRow = Math.max(0, row - 1);
      break;
    case 'down':
      newRow = Math.min(gridDimensions.rows - 1, row + 1);
      break;
    case 'left':
      newCol = Math.max(0, col - 1);
      break;
    case 'right':
      newCol = Math.min(gridDimensions.columns - 1, col + 1);
      break;
  }
  
  const newIndex = getIndexFromPosition(newRow, newCol, gridDimensions.columns);
  
  // Ensure we don't go beyond the actual number of items
  return Math.min(newIndex, gridDimensions.totalItems - 1);
};

export const findServiceIndex = (service: Service, services: Service[]): number => {
  return services.findIndex(s => s.id === service.id);
};

export const constrainIndexToFilteredServices = (
  globalIndex: number,
  allServices: Service[],
  filteredServices: Service[]
): number => {
  const service = allServices[globalIndex];
  if (!service) return -1;
  
  return findServiceIndex(service, filteredServices);
};