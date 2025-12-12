import { Router } from "express";
import { body } from "express-validator";
import {
	submitContactForm,
	getSubmissions,
} from "../controllers/contactController";
import { authenticate, authorize } from "../middleware/auth";
import { validate } from "../middleware/validation";
import { UserRole } from "../models/User";

const router = Router();

// Validation Rules
const contactValidation = [
	body("name").notEmpty().withMessage("Name is required").trim(),
	body("email").isEmail().withMessage("Invalid email address"),
	body("subject").notEmpty().withMessage("Subject is required").trim(),
	body("message").notEmpty().withMessage("Message is required"),
];

/**
 * @route   POST /api/contact
 * @desc    Submit contact form
 * @access  Public
 */
router.post("/", validate(contactValidation), submitContactForm);

/**
 * @route   GET /api/contact/submissions
 * @desc    Get contact submissions
 * @access  Private (Admin only)
 */
router.get(
	"/submissions",
	authenticate,
	authorize([UserRole.SUPER_ADMIN, UserRole.ADMIN]),
	getSubmissions
);

export default router;
