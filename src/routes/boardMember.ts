import { Router } from "express";
import { body } from "express-validator";
import {
	getBoardMembers,
	getAllBoardMembers,
	getBoardMember,
	createBoardMember,
	updateBoardMember,
	deleteBoardMember,
} from "../controllers/boardMemberController";
import { authenticate, authorize } from "../middleware/auth";
import { validate } from "../middleware/validation";
import { UserRole } from "../models/User";

const router = Router();

// Validation Rules
const boardMemberValidation = [
	body("name").notEmpty().withMessage("Name is required").trim(),
	body("position").notEmpty().withMessage("Position is required").trim(),
	body("image").notEmpty().withMessage("Image URL is required").isURL(),
	body("order").optional().isInt(),
];

/**
 * @route   GET /api/board-members
 * @desc    Get all active board members
 * @access  Public
 */
router.get("/", getBoardMembers);

/**
 * @route   GET /api/board-members/all
 * @desc    Get all board members (admin view)
 * @access  Private
 */
router.get(
	"/all",
	authenticate,
	authorize([UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR]),
	getAllBoardMembers
);

/**
 * @route   GET /api/board-members/:id
 * @desc    Get single board member
 * @access  Public
 */
router.get("/:id", getBoardMember);

/**
 * @route   POST /api/board-members
 * @desc    Create board member
 * @access  Private (Admin)
 */
router.post(
	"/",
	authenticate,
	authorize([UserRole.SUPER_ADMIN, UserRole.ADMIN]),
	validate(boardMemberValidation),
	createBoardMember
);

/**
 * @route   PUT /api/board-members/:id
 * @desc    Update board member
 * @access  Private (Admin)
 */
router.put(
	"/:id",
	authenticate,
	authorize([UserRole.SUPER_ADMIN, UserRole.ADMIN]),
	validate([
		body("name").optional(),
		body("position").optional(),
		body("image").optional().isURL(),
	]),
	updateBoardMember
);

/**
 * @route   DELETE /api/board-members/:id
 * @desc    Delete board member
 * @access  Private (Admin)
 */
router.delete(
	"/:id",
	authenticate,
	authorize([UserRole.SUPER_ADMIN, UserRole.ADMIN]),
	deleteBoardMember
);

export default router;
