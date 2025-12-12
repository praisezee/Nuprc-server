import express, { Application, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";

// Load environment variables (Must be before other imports)
dotenv.config();

import { connectDB } from "./utils/db";
import { errorHandler } from "./middleware/errorHandler";

// Import routes
import authRoutes from "./routes/auth";
import newsRoutes from "./routes/news";
import publicationRoutes from "./routes/publications";
import regulationRoutes from "./routes/regulations";
import mediaRoutes from "./routes/media";
import pageRoutes from "./routes/pages";
import portalRoutes from "./routes/portals";
import faqRoutes from "./routes/faq";
import settingsRoutes from "./routes/settings";
import contactRoutes from "./routes/contact";
import uploadRoutes from "./routes/upload";
import dashboardRoutes from "./routes/dashboard";
import boardMemberRoutes from "./routes/boardMember";
import aiRoutes from "./routes/ai";
import configRoutes from "./routes/configRoutes";
import userRoutes from "./routes/users";
import adRoutes from "./routes/ads";

// Initialize Express app
const app: Application = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet()); // Security headers
app.use(
	cors({
		origin: process.env.CORS_ORIGIN || "http://localhost:3000",
		credentials: true,
	})
);
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Health check route
app.get("/api/health", (_req: Request, res: Response) => {
	res.json({
		success: true,
		message: "NUPRC API is running",
		timestamp: new Date().toISOString(),
	});
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/publications", publicationRoutes);
app.use("/api/regulations", regulationRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/pages", pageRoutes);
app.use("/api/portals", portalRoutes);
app.use("/api/faq", faqRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/upload", uploadRoutes); // File upload
app.use("/api/dashboard", dashboardRoutes); // Dashboard stats
app.use("/api/board-members", boardMemberRoutes); // Board Members
app.use("/api/ai", aiRoutes); // AI Chat
app.use("/api/config", configRoutes); // App Config
app.use("/api/users", userRoutes);
app.use("/api/ads", adRoutes); // Ads
// etc.

// 404 handler
app.use((_req: Request, res: Response) => {
	res.status(404).json({
		success: false,
		message: "Route not found",
	});
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
const startServer = async () => {
	try {
		// Connect to MongoDB
		await connectDB();

		// Start listening
		app.listen(PORT, () => {
			console.log(`🚀 Server running on port ${PORT}`);
			console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
			console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
		});
	} catch (error) {
		console.error("Failed to start server:", error);
		process.exit(1);
	}
};

// Start server if run directly
if (require.main === module) {
	startServer();
}

export default app;
