import { Request, Response, NextFunction } from "express";
import FAQ from "../models/FAQ";
import { FAQQuery } from "../types/controllerTypes";
import { AppError } from "../middleware/errorHandler";
import AuditLog, { AuditAction } from "../models/AuditLog";

/**
 * @route   GET /api/faq
 * @desc    Get all FAQs (public: published only, auth: all)
 * @access  Public
 */
export const getFAQs = async (
	req: Request<{}, {}, {}, FAQQuery>,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const query: Record<string, any> = {};

		if (req.query.search) {
			query.$text = { $search: req.query.search };
		}

		if (req.query.category) {
			query.category = req.query.category;
		}

		// Public only sees published
		if (!req.user) {
			query.isPublished = true;
		}

		const faqs = await FAQ.find(query).sort({ order: 1, createdAt: -1 });

		res.json({
			success: true,
			count: faqs.length,
			data: faqs,
		});
	} catch (error) {
		next(error);
	}
};

/**
 * @route   POST /api/faq
 * @desc    Create new FAQ
 * @access  Private (Admin/Editor)
 */
export const createFAQ = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		if (!req.user) {
			throw new AppError("Authentication required", 401);
		}

		req.body.createdBy = req.user.userId;

		const faq = await FAQ.create(req.body);

		// Audit Log
		await AuditLog.create({
			user: req.user.userId,
			action: AuditAction.CREATE,
			resource: "FAQ",
			resourceId: faq._id,
			ipAddress: req.ip,
			userAgent: req.headers["user-agent"],
			timestamp: new Date(),
		});

		res.status(201).json({
			success: true,
			data: faq,
		});
	} catch (error) {
		next(error);
	}
};

/**
 * @route   PUT /api/faq/:id
 * @desc    Update FAQ
 * @access  Private (Admin/Editor)
 */
export const updateFAQ = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		if (!req.user) {
			throw new AppError("Authentication required", 401);
		}

		let faq = await FAQ.findById(req.params.id);

		if (!faq) {
			throw new AppError("FAQ not found", 404);
		}

		faq = await FAQ.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true,
		});

		// Audit Log
		await AuditLog.create({
			user: req.user.userId,
			action: AuditAction.UPDATE,
			resource: "FAQ",
			resourceId: faq!._id,
			changes: req.body,
			ipAddress: req.ip,
			userAgent: req.headers["user-agent"],
			timestamp: new Date(),
		});

		res.json({
			success: true,
			data: faq,
		});
	} catch (error) {
		next(error);
	}
};

/**
 * @route   DELETE /api/faq/:id
 * @desc    Delete FAQ
 * @access  Private (Admin/Super Admin)
 */
export const deleteFAQ = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		if (!req.user) {
			throw new AppError("Authentication required", 401);
		}

		const faq = await FAQ.findById(req.params.id);

		if (!faq) {
			throw new AppError("FAQ not found", 404);
		}

		await faq.deleteOne();

		// Audit Log
		await AuditLog.create({
			user: req.user.userId,
			action: AuditAction.DELETE,
			resource: "FAQ",
			resourceId: faq._id,
			ipAddress: req.ip,
			userAgent: req.headers["user-agent"],
			timestamp: new Date(),
		});

		res.json({
			success: true,
			data: {},
		});
	} catch (error) {
		next(error);
	}
};
