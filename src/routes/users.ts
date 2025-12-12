import { Router } from "express";
import { body } from "express-validator";
import {
	getUsers,
	getUserById,
	createUser,
	updateUser,
	deleteUser,
} from "../controllers/userController";
import { authenticate, authorize } from "../middleware/auth";
import { validate } from "../middleware/validation";
import { UserRole } from "../models/User";

const router = Router();

// Validation Rules
const userValidation = [
	body("firstName").notEmpty().withMessage("First name is required").trim(),
	body("lastName").notEmpty().withMessage("Last name is required").trim(),
	body("email")
		.isEmail()
		.withMessage("Please provide a valid email")
		.normalizeEmail(),
	body("password")
		.isLength({ min: 8 })
		.withMessage("Password must be at least 8 characters"),
	body("role")
		.optional()
		.customSanitizer((val) =>
			typeof val === "string" ? val.toLowerCase().replace(/_/g, "-") : val
		)
		.isIn(Object.values(UserRole))
		.withMessage("Invalid role"),
];

const updateUserValidation = [
	body("firstName").optional().notEmpty().trim(),
	body("lastName").optional().notEmpty().trim(),
	body("email").optional().isEmail(),
	body("role")
		.optional()
		.customSanitizer((val) =>
			typeof val === "string" ? val.toLowerCase().replace(/_/g, "-") : val
		)
		.isIn(Object.values(UserRole)),
	body("password").optional().isLength({ min: 8 }),
];

// Apply authentication to all routes
router.use(authenticate);

/**
 * @route   GET /api/users
 * @desc    Get all users
 * @access  Private (Admin)
 */
router.get("/", authorize([UserRole.SUPER_ADMIN, UserRole.ADMIN]), getUsers);

/**
 * @route   GET /api/users/:id
 * @desc    Get single user
 * @access  Private (Admin)
 */
router.get(
	"/:id",
	authorize([UserRole.SUPER_ADMIN, UserRole.ADMIN]),
	getUserById
);

/**
 * @route   POST /api/users
 * @desc    Create user
 * @access  Private (Admin)
 */
router.post(
	"/",
	authorize([UserRole.SUPER_ADMIN, UserRole.ADMIN]),
	validate(userValidation),
	createUser
);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user
 * @access  Private (Super Admin)
 */
router.put(
	"/:id",
	authorize([UserRole.SUPER_ADMIN]),
	validate(updateUserValidation),
	updateUser
);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user
 * @access  Private (Super Admin)
 */
router.delete("/:id", authorize([UserRole.SUPER_ADMIN]), deleteUser);

export default router;
