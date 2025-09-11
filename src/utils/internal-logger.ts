/**
 * The title used in logs and error messages for the library.
 * @internal
 */
export const AOP_TITLE = 'nestjs-saop';

/**
 * Internal logger for the library, used for warnings and informational messages.
 * @internal
 */
export const internalLogger = {
  warn: (message: string) => {
    console.warn(`[${AOP_TITLE}]: ${message}`);
  },
};
