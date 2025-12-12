import { Request, Response, NextFunction } from "express";
import ContactSubmission from "../models/ContactSubmission";

/**
 * @route   POST /api/contact
 * @desc    Submit contact form
 * @access  Public
 */
export const submitContactForm = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const { name, email, subject, message } = req.body;

		await ContactSubmission.create({
			name,
			email,
			subject,
			message,
			ipAddress: req.ip,
		});

		// In a real app, trigger email service here to notify admins
		// await sendEmail(...)

		res.status(201).json({
			success: true,
			message: "Your message has been received. We will get back to you shortly.",
		});
	} catch (error) {
		next(error);
	}
};

/**
 * @route   GET /api/contact/submissions
 * @desc    Get all contact submissions
 * @access  Private (Admin only)
 */
export const getSubmissions = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const page = parseInt(req.query.page as string) || 1;
		const limit = parseInt(req.query.limit as string) || 20;
		const startIndex = (page - 1) * limit;

		const total = await ContactSubmission.countDocuments();
		const submissions = await ContactSubmission.find()
			.sort({ createdAt: -1 })
			.skip(startIndex)
			.limit(limit);

		res.json({
			success: true,
			count: submissions.length,
			pagination: {
				page,
				limit,
				total,
				pages: Math.ceil(total / limit),
			},
			data: submissions,
		});
	} catch (error) {
		next(error);
	}
};
