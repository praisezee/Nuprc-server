import { Request, Response, NextFunction } from "express";

export const getHomePageConfig = async (
	_req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		// In the future, this can be fetched from a database model 'PageConfig'
		const config = {
			heroValues: {
				vision: "Be Africa's leading Regulator.",
				mission:
					"Promoting sustainable value creation from Nigeria's Petroleum Resources for shared prosperity.",
			},
			pdfs: {
				magazine: {
					file: "/pdfs/Upstream-Gaze-Magazine-Vol.-11.pdf",
					title: "The Upstream Gaze - Vol. 11",
				},
				serviceCharter: {
					file: "/pdfs/2025-NURPC-Integrated-Charter-printed.pdf",
					title: "NUPRC – Service Charter",
				},
			},
		};

		res.json({
			success: true,
			data: config,
		});
	} catch (error) {
		next(error);
	}
};
