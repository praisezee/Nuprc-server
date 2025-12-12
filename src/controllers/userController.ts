import { Request, Response, NextFunction } from "express";
import User, { UserRole } from "../models/User";
import { AppError } from "../middleware/errorHandler";
import AuditLog, { AuditAction } from "../models/AuditLog";

/**
 * @route   GET /api/users
 * @desc    Get all users with filtering
 * @access  Private (Admin)
 */
export const getUsers = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		// Query building
		const queryObject: any = {};

		// Search functionality
		if (req.query.search) {
			const search = req.query.search as string;
			queryObject.$or = [
				{ firstName: { $regex: search, $options: "i" } },
				{ lastName: { $regex: search, $options: "i" } },
				{ email: { $regex: search, $options: "i" } },
			];
		}

		// Role filtering
		if (
			req.query.role &&
			Object.values(UserRole).includes(req.query.role as UserRole)
		) {
			queryObject.role = req.query.role;
		}

		const users = await User.find(queryObject)
			.select("-password")
			.sort({ createdAt: -1 });

		res.json({
			success: true,
			count: users.length,
			data: users,
		});
	} catch (error) {
		next(error);
	}
};

/**
 * @route   GET /api/users/:id
 * @desc    Get single user
 * @access  Private (Admin)
 */
export const getUserById = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const user = await User.findById(req.params.id).select("-password");

		if (!user) {
			throw new AppError("User not found", 404);
		}

		res.json({
			success: true,
			data: user,
		});
	} catch (error) {
		next(error);
	}
};

/**
 * @route   POST /api/users
 * @desc    Create new user
 * @access  Private (Admin)
 */
export const createUser = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const { firstName, lastName, email, password, role } = req.body;

		// Check if user already exists
		const userExists = await User.findOne({ email });
		if (userExists) {
			throw new AppError("User already exists", 400);
		}

		const user = await User.create({
			firstName,
			lastName,
			email,
			password,
			role: role || UserRole.CONTENT_MANAGER,
		});

		// Log creation
		if (req.user) {
			await AuditLog.create({
				user: req.user.userId,
				action: AuditAction.CREATE,
				resource: "User",
				resourceId: user._id,
				ipAddress: req.ip,
				userAgent: req.headers["user-agent"],
				timestamp: new Date(),
			});
		}

		res.status(201).json({
			success: true,
			data: {
				_id: user._id,
				firstName: user.firstName,
				lastName: user.lastName,
				email: user.email,
				role: user.role,
				isActive: user.isActive,
				createdAt: user.createdAt,
			},
		});
	} catch (error) {
		next(error);
	}
};

/**
 * @route   PUT /api/users/:id
 * @desc    Update user
 * @access  Private (Super Admin)
 */
export const updateUser = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const { firstName, lastName, role, isActive, password } = req.body;

		let user = await User.findById(req.params.id);

		if (!user) {
			throw new AppError("User not found", 404);
		}

		// Updates
		if (firstName) user.firstName = firstName;
		if (lastName) user.lastName = lastName;
		if (role) user.role = role;
		if (typeof isActive === "boolean") user.isActive = isActive;
		if (password) user.password = password; // Will be hashed by pre-save hook

		await user.save();

		// Log update
		if (req.user) {
			await AuditLog.create({
				user: req.user.userId,
				action: AuditAction.UPDATE,
				resource: "User",
				resourceId: user._id,
				ipAddress: req.ip,
				userAgent: req.headers["user-agent"],
				timestamp: new Date(),
			});
		}

		res.json({
			success: true,
			data: {
				_id: user._id,
				firstName: user.firstName,
				lastName: user.lastName,
				email: user.email,
				role: user.role,
				isActive: user.isActive,
				createdAt: user.createdAt,
			},
		});
	} catch (error) {
		next(error);
	}
};

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user
 * @access  Private (Super Admin)
 */
export const deleteUser = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const user = await User.findById(req.params.id);

		if (!user) {
			throw new AppError("User not found", 404);
		}

		// Prevent deleting self (simple check)
		if (req.user && user._id.toString() === req.user.userId) {
			throw new AppError("You cannot delete your own account", 400);
		}

		await user.deleteOne();

		// Log deletion
		if (req.user) {
			await AuditLog.create({
				user: req.user.userId,
				action: AuditAction.DELETE,
				resource: "User",
				resourceId: user._id,
				ipAddress: req.ip,
				userAgent: req.headers["user-agent"],
				timestamp: new Date(),
			});
		}

		res.json({
			success: true,
			message: "User deleted successfully",
		});
	} catch (error) {
		next(error);
	}
};
