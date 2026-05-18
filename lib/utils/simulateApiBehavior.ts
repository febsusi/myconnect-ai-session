import * as Sentry from '@sentry/nextjs';

export async function simulateApiBehavior<T>(
  fn: () => Promise<T>,
  delayMs: number = 800,
  failureRate: number = 0.1
): Promise<T> {
  await new Promise(resolve => setTimeout(resolve, delayMs));
  
  if (Math.random() < failureRate) {
    const error = new Error('Simulated API failure - testing Sentry integration');
    Sentry.captureException(error);
    throw error;
  }
  
  return fn();
}