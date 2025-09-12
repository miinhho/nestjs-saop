import { Logger } from '@nestjs/common';

/**
 * Internal logger instance for the AOP module
 *
 * This logger is used for logging internal messages, warnings, and errors
 * related to the AOP functionality within the NestJS-SAOP library.
 *
 * @internal
 */
export const logger = new Logger('Nestjs-SAOP', { timestamp: true });
