import { Request, Response, NextFunction } from "express";
import Groq from "groq-sdk";
import { AppError } from "../middleware/errorHandler";

/**
 * @route   POST /api/ai/chat
 * @desc    Chat with Nuno AI (powered by Groq)
 * @access  Public
 */
export const chatWithAI = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const { message } = req.body;

		if (!message) {
			throw new AppError("Message is required", 400);
		}

		// Check for API Key
		if (!process.env.GROQ_API_KEY) {
			console.warn("No Groq API Key found.");
			// Fallback mock response
			res.json({
				success: true,
				data: {
					reply:
						"I am Nuno, your AI assistant. My brain connection (API Key) is currently missing. Please ask the administrator to configure it.",
				},
			});
			return;
		}

		const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

		const completion = await groq.chat.completions.create({
			messages: [
				{
					role: "system",
					content:
						"You are Nuno, an intelligent and helpful AI assistant for the Nigerian Upstream Petroleum Regulatory Commission (NUPRC). Assist users with information about NUPRC's regulations, services, and general oil and gas sector inquiries in Nigeria. Be professional, concise, and helpful.",
				},
				{ role: "user", content: message },
			],
			model: "llama-3.3-70b-versatile", // Updated to current supported model
			temperature: 0.7,
			max_tokens: 1024,
		});

		const reply =
			completion.choices[0]?.message?.content ||
			"Sorry, I couldn't generate a response.";

		res.json({
			success: true,
			data: {
				reply,
			},
		});
	} catch (error) {
		console.error("Groq AI Error:", error);
		next(new AppError("Failed to communicate with AI service", 500));
	}
};
