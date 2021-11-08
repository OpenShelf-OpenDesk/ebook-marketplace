import { createContext, useContext } from 'react';
const PreviewBookContext = createContext();

export function usePreviewBookContext() {
  return useContext(PreviewBookContext);
}

export default PreviewBookContext;
