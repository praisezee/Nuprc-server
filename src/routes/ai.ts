import { Router } from "express";
import { chatWithAI } from "../controllers/aiController";
import { body } from "express-validator";
import { validate } from "../middleware/validation";

const router = Router();

const chatValidation = [
	body("message").notEmpty().withMessage("Message is required"),
];

/**
 * @route   POST /api/ai/chat
 * @desc    Chat with AI
 * @access  Public
 */
router.post("/chat", validate(chatValidation), chatWithAI);

export default router;
