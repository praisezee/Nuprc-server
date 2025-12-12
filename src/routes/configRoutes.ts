import express from "express";
import { getHomePageConfig } from "../controllers/configController";

const router = express.Router();

router.get("/home", getHomePageConfig);

export default router;
