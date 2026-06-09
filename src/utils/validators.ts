/**
 * Input validation functions
 */

import { PATTERNS } from "./constants";

export const validators = {
  /**
   * Validate email format
   */
  email: (email: string): boolean => {
    return PATTERNS.EMAIL.test(email);
  },

  /**
   * Validate password strength
   * Requirements: minimum 8 characters, at least one letter, one number, one special character
   */
  password: (password: string): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push("Password must be at least 8 characters long");
    }
    if (!/[A-Za-z]/.test(password)) {
      errors.push("Password must contain at least one letter");
    }
    if (!/\d/.test(password)) {
      errors.push("Password must contain at least one number");
    }
    if (!/[@$!%*#?&]/.test(password)) {
      errors.push("Password must contain at least one special character (@$!%*#?&)");
    }

    return { valid: errors.length === 0, errors };
  },

  /**
   * Validate username format
   */
  username: (username: string): boolean => {
    return PATTERNS.USERNAME.test(username);
  },

  /**
   * Validate URL format
   */
  url: (url: string): boolean => {
    return PATTERNS.URL.test(url);
  },

  /**
   * Validate non-empty string
   */
  required: (value: string): boolean => {
    return value.trim().length > 0;
  },

  /**
   * Validate minimum length
   */
  minLength: (value: string, min: number): boolean => {
    return value.length >= min;
  },

  /**
   * Validate maximum length
   */
  maxLength: (value: string, max: number): boolean => {
    return value.length <= max;
  },

  /**
   * Validate if two values match (for password confirmation)
   */
  match: (value1: string, value2: string): boolean => {
    return value1 === value2;
  },

  /**
   * Validate number range
   */
  range: (value: number, min: number, max: number): boolean => {
    return value >= min && value <= max;
  },
};

/**
 * Form validation helper
 * Returns validation errors for each field
 */
export function validateForm(
  data: Record<string, unknown>,
  rules: Record<string, ((value: unknown) => boolean | { valid: boolean; errors: string[] })[]>
): Record<string, string[]> {
  const errors: Record<string, string[]> = {};

  Object.entries(rules).forEach(([field, fieldRules]) => {
    const value = data[field];
    const fieldErrors: string[] = [];

    fieldRules.forEach((rule) => {
      const result = rule(value);
      if (typeof result === "boolean") {
        if (!result) {
          fieldErrors.push(`${field} validation failed`);
        }
      } else if (!result.valid) {
        fieldErrors.push(...result.errors);
      }
    });

    if (fieldErrors.length > 0) {
      errors[field] = fieldErrors;
    }
  });

  return errors;
}
