import { Request, Response, NextFunction } from "express";

interface ApiError extends Error {
	statusCode?: number;
	isOperational?: boolean;
}

export const errorHandler = (
	err: Error | AppError,
	_req: Request,
	res: Response,
	_next: NextFunction
): void => {
	const statusCode = (err as ApiError).statusCode || 500;
	const message = err.message || "Internal Server Error";

	// Log error for debugging
	if (process.env.NODE_ENV === "development") {
		console.error("Error:", err);
	}

	res.status(statusCode).json({
		success: false,
		message,
		...(process.env.NODE_ENV === "development" && { stack: err.stack }),
	});
};

export class AppError extends Error {
	statusCode: number;
	isOperational: boolean;

	constructor(message: string, statusCode: number = 500) {
		super(message);
		this.statusCode = statusCode;
		this.isOperational = true;

		Error.captureStackTrace(this, this.constructor);
	}
}
