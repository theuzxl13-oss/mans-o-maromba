// Ponto único de troca entre implementações simuladas e reais.
// Ex.: quando o leitor biométrico real estiver disponível:
//   export const biometricReader: BiometricReader = new ControlIdBiometricReader(config);

import type { BiometricReader, PartnerCheckinProvider, PaymentGateway, TurnstileDriver } from './types';
import {
  SimulatedBiometricReader,
  SimulatedPartnerProvider,
  SimulatedPaymentGateway,
  SimulatedTurnstile,
} from './simulated';

export const biometricReader: BiometricReader = new SimulatedBiometricReader();
export const turnstile: TurnstileDriver = new SimulatedTurnstile();
export const wellhub: PartnerCheckinProvider = new SimulatedPartnerProvider('wellhub');
export const totalpass: PartnerCheckinProvider = new SimulatedPartnerProvider('totalpass');
export const paymentGateway: PaymentGateway = new SimulatedPaymentGateway();

export * from './types';
