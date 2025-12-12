import { Request, Response, NextFunction } from "express";
import Portal from "../models/Portal";
import { AppError } from "../middleware/errorHandler";
import AuditLog, { AuditAction } from "../models/AuditLog";

/**
 * @route   GET /api/portals
 * @desc    Get all portals (public: active only, auth: all)
 * @access  Public
 */
export const getPortals = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const query: any = {};

		// If not authenticated, only show active
		if (!req.user) {
			query.isActive = true;
		}

		const portals = await Portal.find(query).sort({ order: 1, name: 1 });

		res.json({
			success: true,
			count: portals.length,
			data: portals,
		});
	} catch (error) {
		next(error);
	}
};

/**
 * @route   POST /api/portals
 * @desc    Create new portal link
 * @access  Private (Admin/Editor)
 */
export const createPortal = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		if (!req.user) {
			throw new AppError("Authentication required", 401);
		}

		req.body.createdBy = req.user.userId;

		const portal = await Portal.create(req.body);

		// Audit Log
		await AuditLog.create({
			user: req.user.userId,
			action: AuditAction.CREATE,
			resource: "Portal",
			resourceId: portal._id,
			ipAddress: req.ip,
			userAgent: req.headers["user-agent"],
			timestamp: new Date(),
		});

		res.status(201).json({
			success: true,
			data: portal,
		});
	} catch (error) {
		next(error);
	}
};

/**
 * @route   PUT /api/portals/:id
 * @desc    Update portal link
 * @access  Private (Admin/Editor)
 */
export const updatePortal = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		if (!req.user) {
			throw new AppError("Authentication required", 401);
		}

		let portal = await Portal.findById(req.params.id);

		if (!portal) {
			throw new AppError("Portal not found", 404);
		}

		portal = await Portal.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true,
		});

		// Audit Log
		await AuditLog.create({
			user: req.user.userId,
			action: AuditAction.UPDATE,
			resource: "Portal",
			resourceId: portal!._id,
			changes: req.body,
			ipAddress: req.ip,
			userAgent: req.headers["user-agent"],
			timestamp: new Date(),
		});

		res.json({
			success: true,
			data: portal,
		});
	} catch (error) {
		next(error);
	}
};

/**
 * @route   DELETE /api/portals/:id
 * @desc    Delete portal link
 * @access  Private (Admin only)
 */
export const deletePortal = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		if (!req.user) {
			throw new AppError("Authentication required", 401);
		}

		const portal = await Portal.findById(req.params.id);

		if (!portal) {
			throw new AppError("Portal not found", 404);
		}

		await portal.deleteOne();

		// Audit Log
		await AuditLog.create({
			user: req.user.userId,
			action: AuditAction.DELETE,
			resource: "Portal",
			resourceId: portal._id,
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
