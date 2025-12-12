import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
// Import models
import User from "../models/User";
import News from "../models/News";
import Publication from "../models/Publication";
import Regulation from "../models/Regulation";
import Media from "../models/Media";
import ContactSubmission from "../models/ContactSubmission";
// import { AppError } from '../middleware/errorHandler';

/**
 * @route   GET /api/dashboard/stats
 * @desc    Get dashboard statistics
 * @access  Private (Admin only)
 */
export const getDashboardStats = async (
	_req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		// Helper to safely get count
		const safeCount = async (model: mongoose.Model<any>) => {
			try {
				return await model.countDocuments();
			} catch (err) {
				console.error(
					`Error counting documents for model ${model.modelName}:`,
					err
				);
				return 0;
			}
		};

		// Run all count promises in parallel
		const [
			userCount,
			newsCount,
			publicationCount,
			regulationCount,
			mediaCount,
			contactCount,
		] = await Promise.all([
			safeCount(User),
			safeCount(News),
			safeCount(Publication),
			safeCount(Regulation),
			safeCount(Media),
			safeCount(ContactSubmission),
		]);

		res.json({
			success: true,
			data: {
				counts: {
					users: userCount,
					news: newsCount,
					publications: publicationCount,
					regulations: regulationCount,
					media: mediaCount,
					messages: contactCount,
				},
				recentActivity: [], // Placeholder
			},
		});
	} catch (error) {
		next(error);
	}
};
