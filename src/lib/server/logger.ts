/**
 * Simple server-side logger
 * Provides consistent logging throughout the application
 */

type LogLevel = 'info' | 'warn' | 'error';

interface LogContext {
	[key: string]: unknown;
}

/**
 * Log a message with optional context
 */
export function log(level: LogLevel, message: string, context?: LogContext): void {
	const logEntry = {
		level,
		message,
		...context,
		timestamp: new Date().toISOString()
	};

	switch (level) {
		case 'error':
			console.error(JSON.stringify(logEntry));
			break;
		case 'warn':
			console.warn(JSON.stringify(logEntry));
			break;
		default:
			console.log(JSON.stringify(logEntry));
	}
}

/**
 * Log an error message
 */
export function logError(message: string, error?: unknown, context?: LogContext): void {
	log('error', message, { ...context, error: error instanceof Error ? error.message : String(error) });
}

/**
 * Log a warning message
 */
export function logWarn(message: string, context?: LogContext): void {
	log('warn', message, context);
}

/**
 * Log an info message
 */
export function logInfo(message: string, context?: LogContext): void {
	log('info', message, context);
}
