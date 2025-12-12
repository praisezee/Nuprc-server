import jwt, { SignOptions } from "jsonwebtoken";
import { IUser } from "../models/User";

export interface JWTPayload {
	userId: string;
	email: string;
	role: string;
}

export interface TokenPair {
	accessToken: string;
	refreshToken: string;
}

/**
 * Generate access token (short-lived)
 */
export const generateAccessToken = (user: IUser): string => {
	const payload: JWTPayload = {
		userId: (user as any)._id.toString(),
		email: user.email,
		role: user.role,
	};

	const options: SignOptions = {
		expiresIn: (process.env.JWT_EXPIRES_IN || "24h") as any, // Cast to any to avoid strict typing issues with ms/StringValue
	};

	return jwt.sign(payload, process.env.JWT_SECRET || "default-secret", options);
};

/**
 * Generate refresh token (long-lived)
 */
export const generateRefreshToken = (user: IUser): string => {
	const payload: JWTPayload = {
		userId: (user as any)._id.toString(),
		email: user.email,
		role: user.role,
	};

	const options: SignOptions = {
		expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || "7d") as any,
	};

	return jwt.sign(
		payload,
		process.env.JWT_REFRESH_SECRET || "default-refresh-secret",
		options
	);
};

/**
 * Generate both access and refresh tokens
 */
export const generateTokenPair = (user: IUser): TokenPair => {
	return {
		accessToken: generateAccessToken(user),
		refreshToken: generateRefreshToken(user),
	};
};

/**
 * Verify access token
 */
export const verifyAccessToken = (token: string): JWTPayload => {
	try {
		return jwt.verify(
			token,
			process.env.JWT_SECRET || "default-secret"
		) as JWTPayload;
	} catch (error) {
		throw new Error("Invalid or expired access token");
	}
};

/**
 * Verify refresh token
 */
export const verifyRefreshToken = (token: string): JWTPayload => {
	try {
		return jwt.verify(
			token,
			process.env.JWT_REFRESH_SECRET || "default-refresh-secret"
		) as JWTPayload;
	} catch (error) {
		throw new Error("Invalid or expired refresh token");
	}
};

/**
 * Extract token from Authorization header
 */
export const extractTokenFromHeader = (
	authHeader: string | undefined
): string | null => {
	if (!authHeader) {
		return null;
	}

	// Expected format: "Bearer <token>"
	const parts = authHeader.split(" ");
	if (parts.length !== 2 || parts[0] !== "Bearer") {
		return null;
	}

	return parts[1] || null;
};
