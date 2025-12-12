import { Request, Response, NextFunction } from "express";
import News, { ContentStatus } from "../models/News";
import { NewsQuery } from "../types/controllerTypes";
import { AppError } from "../middleware/errorHandler";
import AuditLog, { AuditAction } from "../models/AuditLog";

/**
 * @route   GET /api/news
 * @desc    Get all news (public with pagination & filters)
 * @access  Public
 */
export const getNews = async (
	req: Request<{}, {}, {}, NewsQuery>,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const page = parseInt(req.query.page || "1");
		const limit = parseInt(req.query.limit || "10");
		const startIndex = (page - 1) * limit;
		const { category, tag, search, status } = req.query;

		// Build query
		const query: Record<string, any> = {};

		// Filter by status (default to published for public, allow filter for admin)
		if (status) {
			// If filtering by status, ensure user is authenticated/admin (logic usually in middleware, but fail-safe here)
			// For now, we'll assume the route handles auth for non-published status
			query.status = status;
		} else {
			// Default to published only if no specific status requested (or for public API)
			// This might need adjustment based on how we want the public API to behave vs admin API
			// For a shared endpoint:
			if (!req.user) {
				query.status = ContentStatus.PUBLISHED;
			}
		}

		if (category) {
			query.category = category;
		}

		if (tag) {
			query.tags = { $in: [tag] };
		}

		if (search) {
			query.$text = { $search: search };
		}

		// specific handling for public users - only show published content
		if (!req.user) {
			query.status = ContentStatus.PUBLISHED;
		}

		const total = await News.countDocuments(query);
		const news = await News.find(query)
			.populate("author", "firstName lastName")
			.sort({ publishedAt: -1, createdAt: -1 })
			.skip(startIndex)
			.limit(limit);

		res.json({
			success: true,
			count: news.length,
			pagination: {
				page,
				limit,
				total,
				pages: Math.ceil(total / limit),
			},
			data: news,
		});
	} catch (error) {
		next(error);
	}
};

/**
 * @route   GET /api/news/:slug
 * @desc    Get single news article by slug
 * @access  Public
 */
export const getNewsBySlug = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const { slug } = req.params;

		const article = await News.findOne({ slug }).populate(
			"author",
			"firstName lastName"
		);

		if (!article) {
			throw new AppError("News article not found", 404);
		}

		// Increment views if public and published
		if (!req.user && article.status === ContentStatus.PUBLISHED) {
			article.views += 1;
			await article.save({ validateBeforeSave: false });
		}

		// Check if user has access to non-published content
		if (article.status !== ContentStatus.PUBLISHED && !req.user) {
			throw new AppError("News article not found", 404);
		}

		res.json({
			success: true,
			data: article,
		});
	} catch (error) {
		next(error);
	}
};

/**
 * @route   GET /api/news/id/:id
 * @desc    Get single news article by ID
 * @access  Public
 */
export const getNewsById = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const { id } = req.params;

		const article = await News.findById(id).populate(
			"author",
			"firstName lastName"
		);

		if (!article) {
			throw new AppError("News article not found", 404);
		}

		// Increment views if public and published
		if (!req.user && article.status === ContentStatus.PUBLISHED) {
			article.views += 1;
			await article.save({ validateBeforeSave: false });
		}

		// Check if user has access to non-published content
		if (article.status !== ContentStatus.PUBLISHED && !req.user) {
			throw new AppError("News article not found", 404);
		}

		res.json({
			success: true,
			data: article,
		});
	} catch (error) {
		next(error);
	}
};

/**
 * @route   POST /api/news
 * @desc    Create new news article
 * @access  Private (Admin/Editor)
 */
export const createNews = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		if (!req.user) {
			throw new AppError("Authentication required", 401);
		}

		req.body.author = req.user.userId;

		const news = await News.create(req.body);

		// Audit Log
		await AuditLog.create({
			user: req.user.userId,
			action: AuditAction.CREATE,
			resource: "News",
			resourceId: news._id,
			ipAddress: req.ip,
			userAgent: req.headers["user-agent"],
			timestamp: new Date(),
		});

		res.status(201).json({
			success: true,
			data: news,
		});
	} catch (error) {
		next(error);
	}
};

/**
 * @route   PUT /api/news/:id
 * @desc    Update news article
 * @access  Private (Admin/Editor)
 */
export const updateNews = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		if (!req.user) {
			throw new AppError("Authentication required", 401);
		}

		let news = await News.findById(req.params.id);

		if (!news) {
			throw new AppError("News article not found", 404);
		}

		// Manually generate slug if title is being updated
		if (req.body.title) {
			req.body.slug = req.body.title
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, "-")
				.replace(/^-+|-+$/g, "");
		}

		news = await News.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true,
		});

		// Audit Log
		await AuditLog.create({
			user: req.user.userId,
			action: AuditAction.UPDATE,
			resource: "News",
			resourceId: news!._id,
			changes: req.body, // In a real app, calculate diff
			ipAddress: req.ip,
			userAgent: req.headers["user-agent"],
			timestamp: new Date(),
		});

		res.json({
			success: true,
			data: news,
		});
	} catch (error) {
		next(error);
	}
};

/**
 * @route   DELETE /api/news/:id
 * @desc    Delete news article
 * @access  Private (Admin only)
 */
export const deleteNews = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		if (!req.user) {
			throw new AppError("Authentication required", 401);
		}

		const news = await News.findById(req.params.id);

		if (!news) {
			throw new AppError("News article not found", 404);
		}

		await news.deleteOne();

		// Audit Log
		await AuditLog.create({
			user: req.user.userId,
			action: AuditAction.DELETE,
			resource: "News",
			resourceId: news._id,
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
