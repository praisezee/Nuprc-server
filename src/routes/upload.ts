import { Router } from "express";
import { uploadFile } from "../controllers/uploadController";
import { authenticate } from "../middleware/auth";
import { upload } from "../services/fileUpload";

const router = Router();

/**
 * @route   POST /api/upload
 * @desc    Upload a single file
 * @access  Private
 */
router.post(
	"/",
	authenticate,
	upload.single("file"), // 'file' is the form-data key
	uploadFile
);

export default router;
