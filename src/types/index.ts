import { InfraCalcApp } from "../assets/scripts/infra-calc-scripts";
export {};

declare global {
  interface Window {
    InfraCalc: InfraCalcApp;
  }
} 