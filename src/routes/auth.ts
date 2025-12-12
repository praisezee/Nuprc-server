import { Router } from "express";
import { body } from "express-validator";
import {
	login,
	refreshToken,
	logout,
	getCurrentUser,
	changePassword,
} from "../controllers/authController";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validation";

const router = Router();

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post(
	"/login",
	validate([
		body("email")
			.isEmail()
			.withMessage("Please provide a valid email address")
			.normalizeEmail(),
		body("password")
			.notEmpty()
			.withMessage("Password is required")
			.isLength({ min: 8 })
			.withMessage("Password must be at least 8 characters long"),
	]),
	login
);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post(
	"/refresh",
	validate([
		body("refreshToken").notEmpty().withMessage("Refresh token is required"),
	]),
	refreshToken
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post("/logout", authenticate, logout);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
router.get("/me", authenticate, getCurrentUser);

/**
 * @route   POST /api/auth/change-password
 * @desc    Change password
 * @access  Private
 */
router.post(
	"/change-password",
	authenticate,
	validate([
		body("currentPassword")
			.notEmpty()
			.withMessage("Current password is required"),
		body("newPassword")
			.notEmpty()
			.withMessage("New password is required")
			.isLength({ min: 8 })
			.withMessage("New password must be at least 8 characters long")
			.matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
			.withMessage(
				"New password must contain at least one uppercase letter, one lowercase letter, and one number"
			),
	]),
	changePassword
);

export default router;
