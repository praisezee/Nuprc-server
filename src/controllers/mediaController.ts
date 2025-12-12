import { Request, Response, NextFunction } from "express";
import Media from "../models/Media";
import { MediaQuery } from "../types/controllerTypes";
import { AppError } from "../middleware/errorHandler";
import AuditLog, { AuditAction } from "../models/AuditLog";

/**
 * @route   GET /api/media
 * @desc    Get all media (public with pagination, filters & search)
 * @access  Public
 */
export const getMedia = async (
	req: Request<{}, {}, {}, MediaQuery>,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const page = parseInt(req.query.page || "1");
		const limit = parseInt(req.query.limit || "20"); // Gallery usually needs more items
		const startIndex = (page - 1) * limit;
		const { type, category, album, search, tag } = req.query;

		// Build query
		const query: Record<string, any> = {};

		if (type) {
			query.type = type;
		}

		if (category) {
			query.category = category;
		}

		if (album) {
			query.album = album;
		}

		if (tag) {
			query.tags = { $in: [tag] };
		}

		if (search) {
			query.$text = { $search: search };
		}

		const total = await Media.countDocuments(query);
		const media = await Media.find(query)
			.populate("uploadedBy", "firstName lastName")
			.sort({ uploadedAt: -1, createdAt: -1 })
			.skip(startIndex)
			.limit(limit);

		res.json({
			success: true,
			count: media.length,
			pagination: {
				page,
				limit,
				total,
				pages: Math.ceil(total / limit),
			},
			data: media,
		});
	} catch (error) {
		next(error);
	}
};

/**
 * @route   GET /api/media/:id
 * @desc    Get single media item
 * @access  Public
 */
export const getMediaItem = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const media = await Media.findById(req.params.id).populate(
			"uploadedBy",
			"firstName lastName"
		);

		if (!media) {
			throw new AppError("Media not found", 404);
		}

		res.json({
			success: true,
			data: media,
		});
	} catch (error) {
		next(error);
	}
};

/**
 * @route   POST /api/media
 * @desc    Create/Upload media record (URL based)
 * @access  Private (Admin/Editor)
 */
export const createMedia = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		if (!req.user) {
			throw new AppError("Authentication required", 401);
		}

		req.body.uploadedBy = req.user.userId;

		// If uploadedAt is not provided, default to now
		if (!req.body.uploadedAt) {
			req.body.uploadedAt = new Date();
		}

		const media = await Media.create(req.body);

		// Audit Log
		await AuditLog.create({
			user: req.user.userId,
			action: AuditAction.CREATE,
			resource: "Media",
			resourceId: media._id,
			ipAddress: req.ip,
			userAgent: req.headers["user-agent"],
			timestamp: new Date(),
		});

		res.status(201).json({
			success: true,
			data: media,
		});
	} catch (error) {
		next(error);
	}
};

/**
 * @route   PUT /api/media/:id
 * @desc    Update media record
 * @access  Private (Admin/Editor)
 */
export const updateMedia = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		if (!req.user) {
			throw new AppError("Authentication required", 401);
		}

		let media = await Media.findById(req.params.id);

		if (!media) {
			throw new AppError("Media not found", 404);
		}

		media = await Media.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true,
		});

		// Audit Log
		await AuditLog.create({
			user: req.user.userId,
			action: AuditAction.UPDATE,
			resource: "Media",
			resourceId: media!._id,
			changes: req.body,
			ipAddress: req.ip,
			userAgent: req.headers["user-agent"],
			timestamp: new Date(),
		});

		res.json({
			success: true,
			data: media,
		});
	} catch (error) {
		next(error);
	}
};

/**
 * @route   DELETE /api/media/:id
 * @desc    Delete media record
 * @access  Private (Admin/Super Admin)
 */
export const deleteMedia = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		if (!req.user) {
			throw new AppError("Authentication required", 401);
		}

		const media = await Media.findById(req.params.id);

		if (!media) {
			throw new AppError("Media not found", 404);
		}

		// Note: Actual file deletion from Cloudinary service should be triggered here
		// For now, we just delete the record

		await media.deleteOne();

		// Audit Log
		await AuditLog.create({
			user: req.user.userId,
			action: AuditAction.DELETE,
			resource: "Media",
			resourceId: media._id,
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
