import { Router } from "express";
import { body } from "express-validator";
import {
	getMedia,
	getMediaItem,
	createMedia,
	updateMedia,
	deleteMedia,
} from "../controllers/mediaController";
import { authenticate, authorize } from "../middleware/auth";
import { validate } from "../middleware/validation";
import { UserRole } from "../models/User";
import { MediaType } from "../models/Media";

const router = Router();

// Validation Rules
const mediaValidation = [
	body("title").notEmpty().withMessage("Title is required").trim(),
	body("type")
		.notEmpty()
		.withMessage("Type is required")
		.isIn(Object.values(MediaType))
		.withMessage("Invalid media type"),
	body("url").notEmpty().withMessage("URL is required").isURL(),
	body("thumbnailUrl").optional().isURL(),
];

/**
 * @route   GET /api/media
 * @desc    Get all media
 * @access  Public
 */
router.get("/", getMedia);

/**
 * @route   GET /api/media/:id
 * @desc    Get single media item
 * @access  Public
 */
router.get("/:id", getMediaItem);

/**
 * @route   POST /api/media
 * @desc    Create/Upload media record (URL only)
 * @access  Private (Admin, Editor)
 */
router.post(
	"/",
	authenticate,
	authorize([UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR]),
	validate(mediaValidation),
	createMedia
);

/**
 * @route   PUT /api/media/:id
 * @desc    Update media record
 * @access  Private (Admin, Editor)
 */
router.put(
	"/:id",
	authenticate,
	authorize([UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR]),
	validate([
		body("title").optional(),
		body("type").optional().isIn(Object.values(MediaType)),
		body("url").optional().isURL(),
		body("thumbnailUrl").optional().isURL(),
	]),
	updateMedia
);

/**
 * @route   DELETE /api/media/:id
 * @desc    Delete media record
 * @access  Private (Admin, Super Admin)
 */
router.delete(
	"/:id",
	authenticate,
	authorize([UserRole.SUPER_ADMIN, UserRole.ADMIN]),
	deleteMedia
);

export default router;
