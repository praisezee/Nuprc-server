import { Request, Response, NextFunction } from "express";
import User from "../models/User";
import {
	generateTokenPair,
	verifyRefreshToken,
	generateAccessToken,
} from "../utils/jwt";
import { AppError } from "../middleware/errorHandler";
import AuditLog, { AuditAction } from "../models/AuditLog";

/**
 * @route   POST /api/auth/login
 * @desc    Login user and return tokens
 * @access  Public
 */
export const login = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const { email, password } = req.body;

		// Find user and include password field
		const user = await User.findOne({ email }).select("+password");

		if (!user) {
			throw new AppError("Invalid email or password", 401);
		}

		// Check if user is active
		if (!user.isActive) {
			throw new AppError("Your account has been deactivated", 401);
		}

		// Verify password
		const isPasswordValid = await user.comparePassword(password);

		if (!isPasswordValid) {
			throw new AppError("Invalid email or password", 401);
		}

		// Update last login
		user.lastLogin = new Date();
		await user.save();

		// Generate tokens
		const tokens = generateTokenPair(user);

		// Log login action
		await AuditLog.create({
			user: user._id,
			action: AuditAction.LOGIN,
			resource: "User",
			resourceId: user._id,
			ipAddress: req.ip,
			userAgent: req.headers["user-agent"],
			timestamp: new Date(),
		});

		// Return user info and tokens
		res.json({
			success: true,
			message: "Login successful",
			user: {
				id: user._id,
				email: user.email,
				firstName: user.firstName,
				lastName: user.lastName,
				role: user.role,
				lastLogin: user.lastLogin,
			},
			tokens,
		});
	} catch (error) {
		next(error);
	}
};

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token using refresh token
 * @access  Public
 */
export const refreshToken = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const { refreshToken } = req.body;

		if (!refreshToken) {
			throw new AppError("Refresh token is required", 400);
		}

		// Verify refresh token
		const payload = verifyRefreshToken(refreshToken);

		// Find user
		const user = await User.findById(payload.userId);

		if (!user) {
			throw new AppError("User not found", 401);
		}

		if (!user.isActive) {
			throw new AppError("User account is inactive", 401);
		}

		// Generate new access token
		const accessToken = generateAccessToken(user);

		res.json({
			success: true,
			message: "Token refreshed successfully",
			accessToken,
		});
	} catch (error) {
		next(error);
	}
};

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (client should delete tokens)
 * @access  Private
 */
export const logout = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		if (!req.user) {
			throw new AppError("Authentication required", 401);
		}

		// Log logout action
		await AuditLog.create({
			user: req.user.userId,
			action: AuditAction.LOGOUT,
			resource: "User",
			resourceId: req.user.userId,
			ipAddress: req.ip,
			userAgent: req.headers["user-agent"],
			timestamp: new Date(),
		});

		res.json({
			success: true,
			message: "Logout successful",
		});
	} catch (error) {
		next(error);
	}
};

/**
 * @route   GET /api/auth/me
 * @desc    Get current user info
 * @access  Private
 */
export const getCurrentUser = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		if (!req.user) {
			throw new AppError("Authentication required", 401);
		}

		const user = await User.findById(req.user.userId);

		if (!user) {
			throw new AppError("User not found", 404);
		}

		res.json({
			success: true,
			user: {
				id: user._id,
				email: user.email,
				firstName: user.firstName,
				lastName: user.lastName,
				role: user.role,
				isActive: user.isActive,
				lastLogin: user.lastLogin,
				createdAt: user.createdAt,
			},
		});
	} catch (error) {
		next(error);
	}
};

/**
 * @route   POST /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
export const changePassword = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		if (!req.user) {
			throw new AppError("Authentication required", 401);
		}

		const { currentPassword, newPassword } = req.body;

		// Find user with password
		const user = await User.findById(req.user.userId).select("+password");

		if (!user) {
			throw new AppError("User not found", 404);
		}

		// Verify current password
		const isPasswordValid = await user.comparePassword(currentPassword);

		if (!isPasswordValid) {
			throw new AppError("Current password is incorrect", 401);
		}

		// Update password
		user.password = newPassword;
		await user.save();

		// Log password change
		await AuditLog.create({
			user: user._id,
			action: AuditAction.UPDATE,
			resource: "User",
			resourceId: user._id,
			changes: { field: "password", action: "changed" },
			ipAddress: req.ip,
			userAgent: req.headers["user-agent"],
			timestamp: new Date(),
		});

		res.json({
			success: true,
			message: "Password changed successfully",
		});
	} catch (error) {
		next(error);
	}
};
