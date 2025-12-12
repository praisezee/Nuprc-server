import express from "express";
import {
	getAllAds,
	getPublishedAds,
	getAdById,
	createAd,
	updateAd,
	deleteAd,
} from "../controllers/adController";
import { authenticate, authorize } from "../middleware/auth";
import { UserRole } from "../models/User";

const router = express.Router();

// Public routes
router.get("/published", getPublishedAds);

// Routes that work for both public and admin (with different filtering)
router.get("/", getAllAds);
router.get("/:id", getAdById);

// Admin-only routes
router.post(
	"/",
	authenticate,
	authorize([UserRole.SUPER_ADMIN, UserRole.ADMIN]),
	createAd
);
router.put(
	"/:id",
	authenticate,
	authorize([UserRole.SUPER_ADMIN, UserRole.ADMIN]),
	updateAd
);
router.delete(
	"/:id",
	authenticate,
	authorize([UserRole.SUPER_ADMIN, UserRole.ADMIN]),
	deleteAd
);

export default router;
