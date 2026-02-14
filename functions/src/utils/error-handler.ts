import * as logger from "firebase-functions/logger";
import {ApiResponse} from "../@types";

import {Response} from "express";

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;

  constructor(message: string, statusCode: number, code: string) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, "VALIDATION_ERROR");
    this.name = "ValidationError";
  }
}

export class ExternalApiError extends AppError {
  constructor(message: string, statusCode: number = 502) {
    super(message, statusCode, "EXTERNAL_API_ERROR");
    this.name = "ExternalApiError";
  }
}

export function handleError(error: unknown, res: Response): void {
  if (error instanceof AppError) {
    const response: ApiResponse<null> = {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        statusCode: error.statusCode,
      },
      timestamp: new Date().toISOString(),
    };
    res.status(error.statusCode).json(response);
    return;
  }

  const message: string = error instanceof Error ? error.message : "Unknown error";
  logger.error("Unhandled error", {error});

  const response: ApiResponse<null> = {
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message,
      statusCode: 500,
    },
    timestamp: new Date().toISOString(),
  };
  res.status(500).json(response);
}
