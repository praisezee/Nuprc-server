import { Request, Response, NextFunction } from "express";
import { verifyAccessToken, extractTokenFromHeader } from "../utils/jwt";
import User, { UserRole } from "../models/User";
import { AppError } from "./errorHandler";

// Extend Express Request to include user
declare global {
	namespace Express {
		interface Request {
			user?: {
				userId: string;
				email: string;
				role: UserRole;
			};
		}
	}
}

/**
 * Middleware to verify JWT token and attach user to request
 */
export const authenticate = async (
	req: Request,
	_res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		// Extract token from Authorization header
		const token = extractTokenFromHeader(req.headers.authorization);

		if (!token) {
			throw new AppError("No authentication token provided", 401);
		}

		// Verify token
		const payload = verifyAccessToken(token);

		// Verify user still exists and is active
		const user = await User.findById(payload.userId);

		if (!user) {
			throw new AppError("User not found", 401);
		}

		if (!user.isActive) {
			throw new AppError("User account is inactive", 401);
		}

		// Attach user info to request
		req.user = {
			userId: payload.userId,
			email: payload.email,
			role: user.role,
		};

		next();
	} catch (error: any) {
		if (error instanceof AppError) {
			next(error);
		} else {
			next(new AppError("Invalid or expired token", 401));
		}
	}
};

/**
 * Middleware to check if user has required role(s)
 * Usage: authorize([UserRole.ADMIN, UserRole.SUPER_ADMIN])
 */
export const authorize = (allowedRoles: UserRole[]) => {
	return (req: Request, _res: Response, next: NextFunction): void => {
		if (!req.user) {
			throw new AppError("Authentication required", 401);
		}

		if (!allowedRoles.includes(req.user.role as UserRole)) {
			throw new AppError("You do not have permission to perform this action", 403);
		}

		next();
	};
};

/**
 * Optional authentication - doesn't fail if no token provided
 * Useful for endpoints that work differently for authenticated users
 */
export const optionalAuth = async (
	req: Request,
	_res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const token = extractTokenFromHeader(req.headers.authorization);

		if (token) {
			const payload = verifyAccessToken(token);
			const user = await User.findById(payload.userId);

			if (user && user.isActive) {
				req.user = {
					userId: payload.userId,
					email: payload.email,
					role: user.role,
				};
			}
		}

		next();
	} catch (error) {
		// Silently fail - optional auth
		next();
	}
};
