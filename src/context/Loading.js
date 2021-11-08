import { createContext, useContext } from 'react';
const LoadingContext = createContext();

export function useLoadingContext() {
  return useContext(LoadingContext);
}

export default LoadingContext;
