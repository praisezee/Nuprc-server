import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

// Import Models locally to avoid path alias complexity in scripts
import News from "../src/models/News";
import StaticPage from "../src/models/StaticPage";
import Portal from "../src/models/Portal";
import User from "../src/models/User";

// Import Data
import { newsArticles, staticPages, portalLinks } from "./data/live-content";

dotenv.config({ path: path.join(__dirname, "../.env") });

const MONGODB_URI =
	process.env.MONGODB_URI || "mongodb://localhost:27017/nuprc_db";

const seedLiveData = async () => {
	try {
		await mongoose.connect(MONGODB_URI);
		console.log("Connected to MongoDB for Seeding...");

		// 0. Get or Create Author User
		console.log("Fetching/Creating System User...");
		let adminUser = await User.findOne({ email: "admin@nuprc.gov.ng" });
		if (!adminUser) {
			adminUser = await User.create({
				firstName: "System",
				lastName: "Admin",
				email: "admin@nuprc.gov.ng",
				password: "password123", // Demo password
				role: "admin",
				isActive: true,
			});
		}
		console.log(`Using Author: ${adminUser.email} (${adminUser._id})`);

		// 1. Seed News
		console.log("Seeding News Articles...");
		await News.deleteMany({ title: { $in: newsArticles.map((n) => n.title) } }); // Clean up potential duplicates

		// Map items to include author ID
		const newsWithAuthor = newsArticles.map((article) => ({
			...article,
			author: adminUser!._id,
		}));

		await News.insertMany(newsWithAuthor);
		console.log(`Initialized ${newsArticles.length} News Articles.`);

		// 2. Seed Static Pages
		console.log("Seeding Static Pages...");
		for (const page of staticPages) {
			await StaticPage.findOneAndUpdate(
				{ slug: page.slug },
				{ ...page, isPublished: true, lastEditedBy: adminUser!._id },
				{ upsert: true, new: true }
			);
		}
		console.log(`Initialized ${staticPages.length} Static Pages.`);

		// 3. Seed Portals
		console.log("Seeding Portal Links...");
		await Portal.deleteMany({ url: { $in: portalLinks.map((p) => p.url) } });

		const portalsWithCreator = portalLinks.map((portal) => ({
			...portal,
			createdBy: adminUser!._id,
		}));

		await Portal.insertMany(portalsWithCreator);
		console.log(`Initialized ${portalLinks.length} Portal Links.`);

		console.log("Seeding Complete! Database hydrated with live content.");
		process.exit(0);
	} catch (error) {
		console.error("Seeding functionality failed:", error);
		process.exit(1);
	}
};

seedLiveData();
