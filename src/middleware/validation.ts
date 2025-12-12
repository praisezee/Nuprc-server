import { Request, Response, NextFunction } from "express";
import { validationResult, ValidationChain } from "express-validator";

/**
 * Middleware to handle validation errors from express-validator
 */
export const handleValidationErrors = (
	req: Request,
	res: Response,
	next: NextFunction
): void => {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		const errorMessages = errors.array().map((error) => ({
			field: error.type === "field" ? error.path : "unknown",
			message: error.msg,
		}));

		res.status(400).json({
			success: false,
			message: "Validation failed",
			errors: errorMessages,
		});
		return;
	}

	next();
};

/**
 * Helper to run validation chains
 */
export const validate = (validations: ValidationChain[]) => {
	return async (
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<void> => {
		// Run all validations
		await Promise.all(validations.map((validation) => validation.run(req)));

		// Check for errors
		handleValidationErrors(req, res, next);
	};
};
