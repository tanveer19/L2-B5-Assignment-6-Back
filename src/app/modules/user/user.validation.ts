import { z } from "zod";

// Assuming Role = 'admin' | 'user' | 'agent' and IsActive = 'active' | 'inactive'
const RoleEnum = z.enum(["ADMIN", "USER", "AGENT"]);
const IsActiveEnum = z.enum(["active", "inactive"]);

export const updateUserZodSchema = z.object({
  name: z
    .string()
    .min(2, { message: "name too short" })
    .max(50, { message: "name too long" })
    .optional(),

  email: z.string().email().optional(),

  password: z
    .string()
    .min(8, { message: "minimum 8 characters" })
    .regex(/(?=.*[A-Z])/, {
      message: "password must contain at least 1 uppercase letter",
    })
    .regex(/(?=.*[!@#$%^&*])/, {
      message: "password must contain 1 special character",
    })
    .regex(/(?=.*\d)/, {
      message: "password must contain at least 1 number",
    })
    .optional(),

  phone: z
    .string()
    .regex(/^(?:\+8801\d{9}|01\d{9})$/, {
      message: "Phone must be a valid BD number",
    })
    .optional(),

  role: RoleEnum.optional(),
  IsActive: IsActiveEnum.optional(),
  isDeleted: z.boolean().optional(),
  isVerified: z.boolean().optional(),

  address: z
    .string()
    .max(200, { message: "can't exceed 200 characters" })
    .optional(),
});

export const createUserZodSchema = z.object({
  name: z
    .string()
    .min(2, { message: "name too short" })
    .max(50, { message: "name too long" }),

  email: z.string().email().optional(),

  password: z
    .string()
    .min(8, { message: "minimum 8 characters" })
    .regex(/(?=.*[A-Z])/, {
      message: "password must contain at least 1 uppercase letter",
    })
    .regex(/(?=.*[!@#$%^&*])/, {
      message: "password must contain 1 special character",
    })
    .regex(/(?=.*\d)/, {
      message: "password must contain at least 1 number",
    }),

  phone: z.string().regex(/^01[0-9]{9}$/, {
    message: "Phone must be a valid 11-digit BD number starting with 01",
  }),

  role: RoleEnum.optional(),

  address: z
    .string()
    .max(200, { message: "can't exceed 200 characters" })
    .optional(),
});
