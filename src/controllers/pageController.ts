import { Request, Response, NextFunction } from "express";
import StaticPage from "../models/StaticPage";
import { AppError } from "../middleware/errorHandler";
import AuditLog, { AuditAction } from "../models/AuditLog";

/**
 * @route   GET /api/pages
 * @desc    Get all static pages (public: published only, auth: all)
 * @access  Public
 */
export const getPages = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const query: any = {};

		// If not authenticated or not admin/editor, only show published
		if (!req.user) {
			query.isPublished = true;
		}

		const pages = await StaticPage.find(query)
			.select("title slug isPublished order updatedAt")
			.sort({ order: 1, title: 1 });

		res.json({
			success: true,
			count: pages.length,
			data: pages,
		});
	} catch (error) {
		next(error);
	}
};

/**
 * @route   GET /api/pages/:slug
 * @desc    Get single static page by slug
 * @access  Public
 */
export const getPageBySlug = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const { slug } = req.params;
		const page = await StaticPage.findOne({ slug });

		if (!page) {
			throw new AppError("Page not found", 404);
		}

		// Check visibility
		if (!page.isPublished && !req.user) {
			throw new AppError("Page not found", 404);
		}

		res.json({
			success: true,
			data: page,
		});
	} catch (error) {
		next(error);
	}
};

/**
 * @route   GET /api/pages/id/:id
 * @desc    Get single static page by ID
 * @access  Public
 */
export const getPageById = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const { id } = req.params;
		const page = await StaticPage.findById(id);

		if (!page) {
			throw new AppError("Page not found", 404);
		}

		res.json({
			success: true,
			data: page,
		});
	} catch (error) {
		next(error);
	}
};

/**
 * @route   POST /api/pages
 * @desc    Create new static page
 * @access  Private (Admin/Content Manager)
 */
export const createPage = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		if (!req.user) {
			throw new AppError("Authentication required", 401);
		}

		req.body.lastEditedBy = req.user.userId;

		const page = await StaticPage.create(req.body);

		// Audit Log
		await AuditLog.create({
			user: req.user.userId,
			action: AuditAction.CREATE,
			resource: "StaticPage",
			resourceId: page._id,
			ipAddress: req.ip,
			userAgent: req.headers["user-agent"],
			timestamp: new Date(),
		});

		res.status(201).json({
			success: true,
			data: page,
		});
	} catch (error) {
		next(error);
	}
};

/**
 * @route   PUT /api/pages/:id
 * @desc    Update static page
 * @access  Private (Admin/Content Manager)
 */
export const updatePage = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		if (!req.user) {
			throw new AppError("Authentication required", 401);
		}

		let page = await StaticPage.findById(req.params.id);

		if (!page) {
			throw new AppError("Page not found", 404);
		}

		req.body.lastEditedBy = req.user.userId;

		page = await StaticPage.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true,
		});

		// Audit Log
		await AuditLog.create({
			user: req.user.userId,
			action: AuditAction.UPDATE,
			resource: "StaticPage",
			resourceId: page!._id,
			changes: req.body,
			ipAddress: req.ip,
			userAgent: req.headers["user-agent"],
			timestamp: new Date(),
		});

		res.json({
			success: true,
			data: page,
		});
	} catch (error) {
		next(error);
	}
};

/**
 * @route   DELETE /api/pages/:id
 * @desc    Delete static page
 * @access  Private (Admin only)
 */
export const deletePage = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		if (!req.user) {
			throw new AppError("Authentication required", 401);
		}

		const page = await StaticPage.findById(req.params.id);

		if (!page) {
			throw new AppError("Page not found", 404);
		}

		await page.deleteOne();

		// Audit Log
		await AuditLog.create({
			user: req.user.userId,
			action: AuditAction.DELETE,
			resource: "StaticPage",
			resourceId: page._id,
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
