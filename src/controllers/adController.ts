import { Request, Response } from "express";
import Ad, { AdStatus } from "../models/Ad";

// Get all ads (admin) or published ads (public)
export const getAllAds = async (req: Request, res: Response) => {
	try {
		const page = parseInt(req.query.page as string) || 1;
		const limit = parseInt(req.query.limit as string) || 10;
		const search = req.query.search as string;
		const status = req.query.status as string;

		const query: any = {};

		// If user is not authenticated or not admin, only show published ads
		if (!req.user || req.user.role !== "admin") {
			query.status = AdStatus.PUBLISHED;
		} else if (status) {
			query.status = status;
		}

		// Search functionality
		if (search) {
			query.$or = [
				{ title: { $regex: search, $options: "i" } },
				{ content: { $regex: search, $options: "i" } },
			];
		}

		const skip = (page - 1) * limit;

		const [ads, total] = await Promise.all([
			Ad.find(query)
				.sort({ order: 1, createdAt: -1 })
				.skip(skip)
				.limit(limit)
				.populate("author", "name email")
				.lean(),
			Ad.countDocuments(query),
		]);

		return res.json({
			success: true,
			data: ads,
			pagination: {
				page,
				limit,
				total,
				pages: Math.ceil(total / limit),
			},
		});
	} catch (error) {
		console.error("Error fetching ads:", error);
		return res.status(500).json({
			success: false,
			message: "Failed to fetch ads",
		});
	}
};

// Get published ads for public display
export const getPublishedAds = async (_req: Request, res: Response) => {
	try {
		const ads = await Ad.find({ status: AdStatus.PUBLISHED })
			.sort({ order: 1, createdAt: -1 })
			.lean();

		return res.json({
			success: true,
			data: ads,
		});
	} catch (error) {
		console.error("Error fetching published ads:", error);
		return res.status(500).json({
			success: false,
			message: "Failed to fetch published ads",
		});
	}
};

// Get single ad by ID
export const getAdById = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;

		const ad = await Ad.findById(id).populate("author", "name email");

		if (!ad) {
			return res.status(404).json({
				success: false,
				message: "Ad not found",
			});
		}

		return res.json({
			success: true,
			data: ad,
		});
	} catch (error) {
		console.error("Error fetching ad:", error);
		return res.status(500).json({
			success: false,
			message: "Failed to fetch ad",
		});
	}
};

// Create new ad (admin only)
export const createAd = async (req: Request, res: Response) => {
	try {
		const { title, type, content, link, colSpan, rowSpan, status, order } =
			req.body;

		const ad = new Ad({
			title,
			type,
			content,
			link,
			colSpan: colSpan || 1,
			rowSpan: rowSpan || 1,
			status: status || AdStatus.DRAFT,
			order: order || 0,
			author: req.user!.userId,
		});

		await ad.save();

		return res.status(201).json({
			success: true,
			data: ad,
			message: "Ad created successfully",
		});
	} catch (error: any) {
		console.error("Error creating ad:", error);
		return res.status(400).json({
			success: false,
			message: error.message || "Failed to create ad",
		});
	}
};

// Update ad (admin only)
export const updateAd = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const { title, type, content, link, colSpan, rowSpan, status, order } =
			req.body;

		const ad = await Ad.findById(id);

		if (!ad) {
			return res.status(404).json({
				success: false,
				message: "Ad not found",
			});
		}

		// Update fields
		if (title !== undefined) ad.title = title;
		if (type !== undefined) ad.type = type;
		if (content !== undefined) ad.content = content;
		if (link !== undefined) ad.link = link;
		if (colSpan !== undefined) ad.colSpan = colSpan;
		if (rowSpan !== undefined) ad.rowSpan = rowSpan;
		if (status !== undefined) ad.status = status;
		if (order !== undefined) ad.order = order;

		await ad.save();

		return res.json({
			success: true,
			data: ad,
			message: "Ad updated successfully",
		});
	} catch (error: any) {
		console.error("Error updating ad:", error);
		return res.status(400).json({
			success: false,
			message: error.message || "Failed to update ad",
		});
	}
};

// Delete ad (admin only)
export const deleteAd = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;

		const ad = await Ad.findByIdAndDelete(id);

		if (!ad) {
			return res.status(404).json({
				success: false,
				message: "Ad not found",
			});
		}

		return res.json({
			success: true,
			message: "Ad deleted successfully",
		});
	} catch (error) {
		console.error("Error deleting ad:", error);
		return res.status(500).json({
			success: false,
			message: "Failed to delete ad",
		});
	}
};
