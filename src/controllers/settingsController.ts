import { Request, Response, NextFunction } from "express";
import Settings from "../models/Settings";
import { AppError } from "../middleware/errorHandler";
import AuditLog, { AuditAction } from "../models/AuditLog";

/**
 * @route   GET /api/settings
 * @desc    Get site settings (public)
 * @access  Public
 */
export const getSettings = async (
	_req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		// There should only be one settings document
		const settings = await Settings.findOne();

		if (!settings) {
			// If no settings exist yet, return a default/empty structure or create one
			// For now, let's return null data but success
			res.json({
				success: true,
				data: null,
			});
			return;
		}

		res.json({
			success: true,
			data: settings,
		});
	} catch (error) {
		next(error);
	}
};

/**
 * @route   PUT /api/settings
 * @desc    Update or create site settings
 * @access  Private (Admin only)
 */
export const updateSettings = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		if (!req.user) {
			throw new AppError("Authentication required", 401);
		}

		req.body.lastUpdatedBy = req.user.userId;

		// Try to find existing settings
		let settings = await Settings.findOne();

		if (settings) {
			// Update existing
			settings = await Settings.findByIdAndUpdate(settings._id, req.body, {
				new: true,
				runValidators: true,
			});

			// Audit Log
			await AuditLog.create({
				user: req.user.userId,
				action: AuditAction.UPDATE,
				resource: "Settings",
				resourceId: settings!._id,
				changes: req.body,
				ipAddress: req.ip,
				userAgent: req.headers["user-agent"],
				timestamp: new Date(),
			});
		} else {
			// Create new
			settings = await Settings.create(req.body);

			// Audit Log
			await AuditLog.create({
				user: req.user.userId,
				action: AuditAction.CREATE,
				resource: "Settings",
				resourceId: settings._id,
				ipAddress: req.ip,
				userAgent: req.headers["user-agent"],
				timestamp: new Date(),
			});
		}

		res.json({
			success: true,
			data: settings,
		});
	} catch (error) {
		next(error);
	}
};
