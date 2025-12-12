import dotenv from "dotenv";
import { connectDB } from "../utils/db";
import BoardMember from "../models/BoardMember";

dotenv.config();

const boardMembers = [
	{
		name: "Isa Ibrahim Modibbo",
		position: "Chairman",
		image: "/images/board/placeholder.jpg",
		bio: "Chairman of the NUPRC Board.",
		order: 1,
	},
	{
		name: "Engr. Gbenga Komolafe",
		position: "Commission Chief Executive",
		image: "/images/board/cce.jpg",
		bio: "Commission Chief Executive of the NUPRC.",
		order: 2,
	},
	{
		name: "Bashir Indabawa",
		position: "Executive Commissioner, Exploration & Acreage Management",
		image: "/images/board/placeholder.jpg",
		bio: "Executive Commissioner overseeing Exploration and Acreage Management.",
		order: 3,
	},
	{
		name: "Dr. Kelechi Onyekachi Ofoegbu",
		position: "Executive Commissioner, Corporate Services & Administration",
		image: "/images/board/placeholder.jpg",
		bio: "Executive Commissioner overseeing Corporate Services and Administration.",
		order: 4,
	},
	{
		name: "Mr. Enorense Amadasu",
		position: "Executive Commissioner, Development & Production",
		image: "/images/board/placeholder.jpg",
		bio: "Executive Commissioner overseeing Development and Production.",
		order: 5,
	},
	{
		name: "Mr. Babajide Fasina",
		position: "Executive Commissioner, Economic Regulation & Strategic Planning",
		image: "/images/board/placeholder.jpg",
		bio: "Executive Commissioner overseeing Economic Regulation and Strategic Planning.",
		order: 6,
	},
];

const seedBoardMembers = async () => {
	try {
		await connectDB();
		console.log("Connected to MongoDB");

		// Clear existing members
		await BoardMember.deleteMany({});
		console.log("Cleared existing board members");

		// Insert new members
		await BoardMember.insertMany(boardMembers);
		console.log("Seeded board members successfully");

		process.exit(0);
	} catch (error) {
		console.error("Error seeding board members:", error);
		process.exit(1);
	}
};

seedBoardMembers();
