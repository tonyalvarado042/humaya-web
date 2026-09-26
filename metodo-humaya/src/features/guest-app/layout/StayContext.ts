import { createContext } from 'react';

export interface StayContextValue {
  stayId: string;
  setStayId: (stayId: string) => void;
}

export const StayContext = createContext<StayContextValue | null>(null);
