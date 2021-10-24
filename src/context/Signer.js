import { createContext, useContext } from 'react';
const SignerContext = createContext();

export function useSignerContext() {
  return useContext(SignerContext);
}

export default SignerContext;
