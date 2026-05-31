import { ReactNode } from "react";
export type ModalStep = {
  stepName: string;
  description: string;
  page: ReactNode;
  canSkip: boolean;
  nextAction?: () => void 
}

export type SignInForm = {
  email: string;
  password: string;
}