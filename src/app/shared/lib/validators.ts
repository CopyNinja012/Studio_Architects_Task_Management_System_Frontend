import { z } from 'zod'

export const mobileValidator = z
  .string()
  .regex(/^\d{10}$/, 'Mobile number must be exactly 10 digits')

export const ifscValidator = z
  .string()
  .length(11, 'IFSC code must be exactly 11 characters')

export const bankAccountNumberValidator = z
  .string()
  .min(9, 'Bank account number must be at least 9 digits')
  .max(18, 'Bank account number must not exceed 18 digits')
  .regex(/^\d+$/, 'Bank account number must contain only digits')
