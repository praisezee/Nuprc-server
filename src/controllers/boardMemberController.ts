import { Request, Response, NextFunction } from "express";
import BoardMember from "../models/BoardMember";
import { AppError } from "../middleware/errorHandler";
import AuditLog, { AuditAction } from "../models/AuditLog";

/**
 * @route   GET /api/board-members
 * @desc    Get all board members
 * @access  Public
 */
export const getBoardMembers = async (
	_req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const members = await BoardMember.find({ isActive: true }).sort({ order: 1 });

		res.json({
			success: true,
			count: members.length,
			data: members,
		});
	} catch (error) {
		next(error);
	}
};

/**
 * @route   GET /api/board-members/all
 * @desc    Get all board members including inactive (Admin)
 * @access  Private
 */
export const getAllBoardMembers = async (
	_req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const members = await BoardMember.find().sort({ order: 1 });

		res.json({
			success: true,
			count: members.length,
			data: members,
		});
	} catch (error) {
		next(error);
	}
};

/**
 * @route   GET /api/board-members/:id
 * @desc    Get single board member
 * @access  Public
 */
export const getBoardMember = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const member = await BoardMember.findById(req.params.id);

		if (!member) {
			throw new AppError("Board member not found", 404);
		}

		res.json({
			success: true,
			data: member,
		});
	} catch (error) {
		next(error);
	}
};

/**
 * @route   POST /api/board-members
 * @desc    Create board member
 * @access  Private (Admin)
 */
export const createBoardMember = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const member = await BoardMember.create(req.body);

		// Audit Log
		if (req.user) {
			await AuditLog.create({
				user: req.user.userId,
				action: AuditAction.CREATE,
				resource: "BoardMember",
				resourceId: member._id,
				ipAddress: req.ip,
				userAgent: req.headers["user-agent"],
				timestamp: new Date(),
			});
		}

		res.status(201).json({
			success: true,
			data: member,
		});
	} catch (error) {
		next(error);
	}
};

/**
 * @route   PUT /api/board-members/:id
 * @desc    Update board member
 * @access  Private (Admin)
 */
export const updateBoardMember = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		let member = await BoardMember.findById(req.params.id);

		if (!member) {
			throw new AppError("Board member not found", 404);
		}

		member = await BoardMember.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true,
		});

		// Audit Log
		if (req.user) {
			await AuditLog.create({
				user: req.user.userId,
				action: AuditAction.UPDATE,
				resource: "BoardMember",
				resourceId: member!._id,
				changes: req.body,
				ipAddress: req.ip,
				userAgent: req.headers["user-agent"],
				timestamp: new Date(),
			});
		}

		res.json({
			success: true,
			data: member,
		});
	} catch (error) {
		next(error);
	}
};

/**
 * @route   DELETE /api/board-members/:id
 * @desc    Delete board member
 * @access  Private (Admin)
 */
export const deleteBoardMember = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const member = await BoardMember.findById(req.params.id);

		if (!member) {
			throw new AppError("Board member not found", 404);
		}

		await member.deleteOne();

		// Audit Log
		if (req.user) {
			await AuditLog.create({
				user: req.user.userId,
				action: AuditAction.DELETE,
				resource: "BoardMember",
				resourceId: member._id,
				ipAddress: req.ip,
				userAgent: req.headers["user-agent"],
				timestamp: new Date(),
			});
		}

		res.json({
			success: true,
			data: {},
		});
	} catch (error) {
		next(error);
	}
};
