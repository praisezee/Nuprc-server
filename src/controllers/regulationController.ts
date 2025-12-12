import { Request, Response, NextFunction } from "express";
import Regulation from "../models/Regulation";
import { AppError } from "../middleware/errorHandler";
import AuditLog, { AuditAction } from "../models/AuditLog";
import { ContentStatus } from "../models/News";

/**
 * @route   GET /api/regulations
 * @desc    Get all regulations (public with pagination, filters & search)
 * @access  Public
 */
export const getRegulations = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const page = parseInt(req.query.page as string) || 1;
		const limit = parseInt(req.query.limit as string) || 10;
		const startIndex = (page - 1) * limit;
		const { category, search, status } = req.query;

		// Build query
		const query: any = {};

		// Filter by status (default to published for public)
		if (status) {
			query.status = status;
		} else if (!req.user) {
			query.status = ContentStatus.PUBLISHED;
		}

		if (category) {
			query.category = category;
		}

		if (search) {
			query.$text = { $search: search as string };
		}

		const total = await Regulation.countDocuments(query);
		const regulations = await Regulation.find(query)
			.populate("createdBy", "firstName lastName")
			.sort({ effectiveDate: -1, createdAt: -1 }) // Sort by effective date primarily
			.skip(startIndex)
			.limit(limit);

		res.json({
			success: true,
			count: regulations.length,
			pagination: {
				page,
				limit,
				total,
				pages: Math.ceil(total / limit),
			},
			data: regulations,
		});
	} catch (error) {
		next(error);
	}
};

/**
 * @route   GET /api/regulations/:id
 * @desc    Get single regulation
 * @access  Public
 */
export const getRegulation = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const regulation = await Regulation.findById(req.params.id).populate(
			"createdBy",
			"firstName lastName"
		);

		if (!regulation) {
			throw new AppError("Regulation not found", 404);
		}

		// Check visibility
		if (regulation.status !== ContentStatus.PUBLISHED && !req.user) {
			throw new AppError("Regulation not found", 404);
		}

		res.json({
			success: true,
			data: regulation,
		});
	} catch (error) {
		next(error);
	}
};

/**
 * @route   POST /api/regulations
 * @desc    Create new regulation
 * @access  Private (Admin/Editor)
 */
export const createRegulation = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		if (!req.user) {
			throw new AppError("Authentication required", 401);
		}

		req.body.createdBy = req.user.userId;

		const regulation = await Regulation.create(req.body);

		// Audit Log
		await AuditLog.create({
			user: req.user.userId,
			action: AuditAction.CREATE,
			resource: "Regulation",
			resourceId: regulation._id,
			ipAddress: req.ip,
			userAgent: req.headers["user-agent"],
			timestamp: new Date(),
		});

		res.status(201).json({
			success: true,
			data: regulation,
		});
	} catch (error) {
		next(error);
	}
};

/**
 * @route   PUT /api/regulations/:id
 * @desc    Update regulation
 * @access  Private (Admin/Editor)
 */
export const updateRegulation = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		if (!req.user) {
			throw new AppError("Authentication required", 401);
		}

		let regulation = await Regulation.findById(req.params.id);

		if (!regulation) {
			throw new AppError("Regulation not found", 404);
		}

		regulation = await Regulation.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true,
		});

		// Audit Log
		await AuditLog.create({
			user: req.user.userId,
			action: AuditAction.UPDATE,
			resource: "Regulation",
			resourceId: regulation!._id,
			changes: req.body,
			ipAddress: req.ip,
			userAgent: req.headers["user-agent"],
			timestamp: new Date(),
		});

		res.json({
			success: true,
			data: regulation,
		});
	} catch (error) {
		next(error);
	}
};

/**
 * @route   DELETE /api/regulations/:id
 * @desc    Delete regulation
 * @access  Private (Admin/Super Admin)
 */
export const deleteRegulation = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		if (!req.user) {
			throw new AppError("Authentication required", 401);
		}

		const regulation = await Regulation.findById(req.params.id);

		if (!regulation) {
			throw new AppError("Regulation not found", 404);
		}

		await regulation.deleteOne();

		// Audit Log
		await AuditLog.create({
			user: req.user.userId,
			action: AuditAction.DELETE,
			resource: "Regulation",
			resourceId: regulation._id,
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
