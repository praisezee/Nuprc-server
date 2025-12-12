import { Request } from "express";
import multer, { FileFilterCallback } from "multer";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { AppError } from "../middleware/errorHandler";
// import fs from 'fs';
// Note: We'll use memory storage for serverless compatibility (Vercel/Lambda friendly)
// or disk storage if we want to save temp files. Memory is safer for small files.

// Configure Cloudinary Lazily
const ensureCloudinaryConfig = () => {
	if (!process.env.CLOUDINARY_CLOUD_NAME) {
		console.warn("Cloudinary env vars missing!");
	}
	cloudinary.config({
		cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
		api_key: process.env.CLOUDINARY_API_KEY,
		api_secret: process.env.CLOUDINARY_API_SECRET,
	});
};

// Configure Multer (Memory Storage)
const storage = multer.memoryStorage();

// File Filter
const fileFilter = (
	_req: Request,
	file: Express.Multer.File,
	cb: FileFilterCallback
) => {
	// Allowed types
	const allowedMimeTypes = [
		"image/jpeg",
		"image/png",
		"image/gif",
		"image/webp",
		"application/pdf",
		"application/msword", // .doc
		"application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
		"video/mp4",
		"video/mpeg",
	];

	if (allowedMimeTypes.includes(file.mimetype)) {
		cb(null, true);
	} else {
		cb(
			new AppError(
				"Invalid file type. Only images, PDFs, word docs and videos are allowed.",
				400
			)
		);
	}
};

// Limits
const limits = {
	fileSize: 50 * 1024 * 1024, // 50MB limit (videos can be large)
};

export const upload = multer({
	storage,
	fileFilter,
	limits,
});

/**
 * Upload buffer to Cloudinary (since we use memory storage)
 */
export const uploadToCloudinary = (
	file: Express.Multer.File,
	folder: string = "nuprc_uploads"
): Promise<UploadApiResponse> => {
	ensureCloudinaryConfig();
	// console.log(process.env.CLOUDINARY_API_KEY);
	return new Promise((resolve, reject) => {
		// Determine resource type based on mimetype
		const resourceType = file.mimetype.startsWith("video/")
			? "video"
			: file.mimetype.startsWith("application/pdf") ||
			  file.mimetype.includes("word")
			? "raw" // PDF/Docs usually treated as 'raw' or 'image' (for pages) but 'raw' preserves exact file
			: "auto";

		const uploadStream = cloudinary.uploader.upload_stream(
			{
				folder,
				resource_type: resourceType,
				public_id: `${file.originalname.split(".")[0]}_${Date.now()}`, // Simple unique name
			},
			(error, result) => {
				if (error) {
					console.error("Cloudinary Upload Error:", error);
					reject(new AppError("Image upload failed", 500));
				} else if (result) {
					resolve(result);
				} else {
					reject(new AppError("Unknown error during upload", 500));
				}
			}
		);

		// Write buffer to stream
		uploadStream.end(file.buffer);
	});
};

/**
 * Delete file from Cloudinary
 * (Extract public_id from URL)
 */
export const deleteFromCloudinary = async (fileUrl: string): Promise<void> => {
	ensureCloudinaryConfig();
	try {
		// Basic extraction logic:
		// URL: https://res.cloudinary.com/demo/image/upload/v123456789/folder/sample.jpg
		// Public ID: folder/sample

		// Split by '/'
		const segments = fileUrl.split("/");

		// Find the index of 'upload' in the URL to locate the start of the path
		const uploadIndex = segments.findIndex((s) => s === "upload");

		if (uploadIndex === -1) {
			console.warn(
				"Could not extract public_id from Cloudinary URL: upload segment not found"
			);
			return;
		}

		// The public_id starts after the version number (which starts with 'v')
		// Example: .../upload/v1612.../folder/image.jpg
		// We need 'folder/image'

		// Join segments after 'upload'
		const pathSegments = segments.slice(uploadIndex + 1);

		// Remove version if present (starts with 'v' and is numeric)
		const firstSegment = pathSegments[0];
		if (firstSegment && /^v\d+$/.test(firstSegment)) {
			pathSegments.shift();
		}

		const filename = pathSegments.join("/");

		// Remove extension
		const lastDotIndex = filename.lastIndexOf(".");
		const publicId =
			lastDotIndex !== -1 ? filename.substring(0, lastDotIndex) : filename;

		console.log(`Deleting file from Cloudinary. Public ID: ${publicId}`);

		// Try deleting as 'image' first (default)
		let result = await cloudinary.uploader.destroy(publicId);

		// If not found, try as 'raw' (for PDFs, docs) or 'video'
		if (result.result !== "ok") {
			console.log(`Delete as image failed (${result.result}), trying as raw...`);
			result = await cloudinary.uploader.destroy(publicId, {
				resource_type: "raw",
			});
		}

		if (result.result !== "ok" && publicId) {
			console.log(`Delete as raw failed (${result.result}), trying as video...`);
			result = await cloudinary.uploader.destroy(publicId, {
				resource_type: "video",
			});
		}

		if (result.result === "ok") {
			console.log("Successfully deleted from Cloudinary");
		} else {
			console.warn(`Failed to delete from Cloudinary: ${result.result}`);
		}
	} catch (error) {
		console.error("Delete file error:", error);
		// Don't throw error to prevent blocking the main operation (e.g., deleting post)
	}
};
