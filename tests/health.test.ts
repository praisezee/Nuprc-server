import request from "supertest";
import app from "../src/server"; // Assuming app is exported from server.ts
import mongoose from "mongoose";

describe("Health Check", () => {
	it("GET /api/health should return 200 OK", async () => {
		const res = await request(app).get("/api/health");
		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
	});

	// Clean up
	afterAll(async () => {
		await mongoose.connection.close();
	});
});
