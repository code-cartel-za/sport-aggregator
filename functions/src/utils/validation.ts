import {ValidationError} from "./error-handler";

export function validateRequiredParam(
  params: Record<string, unknown>,
  name: string
): string | number {
  const value: unknown = params[name];
  if (value === undefined || value === null || value === "") {
    throw new ValidationError(`Missing required parameter: ${name}`);
  }
  if (typeof value === "string") return value;
  if (typeof value === "number") return value;
  return String(value);
}

export function validateNumberParam(
  params: Record<string, unknown>,
  name: string,
  min?: number,
  max?: number
): number {
  const raw: unknown = params[name];
  if (raw === undefined || raw === null || raw === "") {
    throw new ValidationError(`Missing required parameter: ${name}`);
  }
  const num: number = Number(raw);
  if (isNaN(num)) {
    throw new ValidationError(`Parameter '${name}' must be a number`);
  }
  if (min !== undefined && num < min) {
    throw new ValidationError(`Parameter '${name}' must be >= ${min}`);
  }
  if (max !== undefined && num > max) {
    throw new ValidationError(`Parameter '${name}' must be <= ${max}`);
  }
  return num;
}

export function validateOptionalNumberParam(
  params: Record<string, unknown>,
  name: string,
  min?: number,
  max?: number
): number | undefined {
  const raw: unknown = params[name];
  if (raw === undefined || raw === null || raw === "") {
    return undefined;
  }
  const num: number = Number(raw);
  if (isNaN(num)) {
    throw new ValidationError(`Parameter '${name}' must be a number`);
  }
  if (min !== undefined && num < min) {
    throw new ValidationError(`Parameter '${name}' must be >= ${min}`);
  }
  if (max !== undefined && num > max) {
    throw new ValidationError(`Parameter '${name}' must be <= ${max}`);
  }
  return num;
}

export function validateStringParam(
  params: Record<string, unknown>,
  name: string,
  allowedValues?: string[]
): string {
  const raw: unknown = params[name];
  if (raw === undefined || raw === null || raw === "") {
    throw new ValidationError(`Missing required parameter: ${name}`);
  }
  const value: string = String(raw);
  if (allowedValues && !allowedValues.includes(value)) {
    throw new ValidationError(
      `Parameter '${name}' must be one of: ${allowedValues.join(", ")}`
    );
  }
  return value;
}
