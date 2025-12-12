import { Request, Response, NextFunction } from "express";
import { uploadToCloudinary } from "../services/fileUpload";
import { AppError } from "../middleware/errorHandler";

/**
 * @route   POST /api/upload
 * @desc    Upload a single file
 * @access  Private (Authenticated)
 */
export const uploadFile = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		if (!req.file) {
			throw new AppError("No file uploaded", 400);
		}

		// Default folder
		const folder = req.body.folder || "nuprc_general";

		const result = await uploadToCloudinary(req.file, folder);

		res.status(200).json({
			success: true,
			data: {
				url: result.secure_url,
				publicId: result.public_id,
				format: result.format,
				size: result.bytes,
			},
		});
	} catch (error) {
		next(error);
	}
};
