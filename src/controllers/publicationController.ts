import { Request, Response, NextFunction } from "express";
import Publication from "../models/Publication";
import { PublicationQuery } from "../types/controllerTypes";
import { AppError } from "../middleware/errorHandler";
import AuditLog, { AuditAction } from "../models/AuditLog";

/**
 * @route   GET /api/publications
 * @desc    Get all publications (public with pagination, filters & search)
 * @access  Public
 */
export const getPublications = async (
	req: Request<{}, {}, {}, PublicationQuery>,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const page = parseInt(req.query.page || "1");
		const limit = parseInt(req.query.limit || "10");
		const startIndex = (page - 1) * limit;
		const { category, year, search } = req.query;

		// Build query
		const query: Record<string, any> = {};

		if (category) {
			query.category = category;
		}

		if (year) {
			query.publishYear = parseInt(year);
		}

		if (search) {
			query.$text = { $search: search };
		}

		const total = await Publication.countDocuments(query);
		const publications = await Publication.find(query)
			.populate("createdBy", "firstName lastName")
			.sort({ publishedAt: -1, createdAt: -1 })
			.skip(startIndex)
			.limit(limit);

		res.json({
			success: true,
			count: publications.length,
			pagination: {
				page,
				limit,
				total,
				pages: Math.ceil(total / limit),
			},
			data: publications,
		});
	} catch (error) {
		next(error);
	}
};

/**
 * @route   GET /api/publications/:id
 * @desc    Get single publication
 * @access  Public
 */
export const getPublication = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const publication = await Publication.findById(req.params.id).populate(
			"createdBy",
			"firstName lastName"
		);

		if (!publication) {
			throw new AppError("Publication not found", 404);
		}

		res.json({
			success: true,
			data: publication,
		});
	} catch (error) {
		next(error);
	}
};

/**
 * @route   POST /api/publications
 * @desc    Create new publication
 * @access  Private (Admin/Editor)
 */
export const createPublication = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		if (!req.user) {
			throw new AppError("Authentication required", 401);
		}

		req.body.createdBy = req.user.userId;

		// If publishedAt is provided string, ensure it's Date object, or default to now
		if (!req.body.publishedAt) {
			req.body.publishedAt = new Date();
		}

		const publication = await Publication.create(req.body);

		// Audit Log
		await AuditLog.create({
			user: req.user.userId,
			action: AuditAction.CREATE,
			resource: "Publication",
			resourceId: publication._id,
			ipAddress: req.ip,
			userAgent: req.headers["user-agent"],
			timestamp: new Date(),
		});

		res.status(201).json({
			success: true,
			data: publication,
		});
	} catch (error) {
		next(error);
	}
};

/**
 * @route   PUT /api/publications/:id
 * @desc    Update publication
 * @access  Private (Admin/Editor)
 */
export const updatePublication = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		if (!req.user) {
			throw new AppError("Authentication required", 401);
		}

		let publication = await Publication.findById(req.params.id);

		if (!publication) {
			throw new AppError("Publication not found", 404);
		}

		publication = await Publication.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true,
		});

		// Audit Log
		await AuditLog.create({
			user: req.user.userId,
			action: AuditAction.UPDATE,
			resource: "Publication",
			resourceId: publication!._id,
			changes: req.body,
			ipAddress: req.ip,
			userAgent: req.headers["user-agent"],
			timestamp: new Date(),
		});

		res.json({
			success: true,
			data: publication,
		});
	} catch (error) {
		next(error);
	}
};

/**
 * @route   DELETE /api/publications/:id
 * @desc    Delete publication
 * @access  Private (Admin/Super Admin)
 */
export const deletePublication = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		if (!req.user) {
			throw new AppError("Authentication required", 401);
		}

		const publication = await Publication.findById(req.params.id);

		if (!publication) {
			throw new AppError("Publication not found", 404);
		}

		await publication.deleteOne();

		// Audit Log
		await AuditLog.create({
			user: req.user.userId,
			action: AuditAction.DELETE,
			resource: "Publication",
			resourceId: publication._id,
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

/**
 * @route   GET /api/publications/:id/download
 * @desc    Increment download count and redirect to file
 * @access  Public
 */
export const downloadPublication = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const publication = await Publication.findById(req.params.id);

		if (!publication) {
			throw new AppError("Publication not found", 404);
		}

		// Increment download count
		publication.downloadCount += 1;
		await publication.save({ validateBeforeSave: false });

		// In a real scenario, this might redirect to the Cloudinary URL
		// or return the file URL for the frontend to handle
		res.json({
			success: true,
			downloadUrl: publication.fileUrl,
		});
	} catch (error) {
		next(error);
	}
};
