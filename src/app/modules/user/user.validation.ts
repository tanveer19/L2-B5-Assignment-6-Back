import { z } from "zod";

// Assuming Role = 'admin' | 'user' | 'agent' and IsActive = 'active' | 'inactive'
const RoleEnum = z.enum(["ADMIN", "USER", "AGENT"]);
const IsActiveEnum = z.enum(["active", "inactive"]);

export const updateUserZodSchema = z
  .object({
    name: z.string().min(1, "Name is required").optional(),
    phone: z
      .string()
      .regex(/^(?:\+88|88)?(01[3-9]\d{8})$/, "Phone must be a valid BD number")
      .optional()
      .or(z.literal("")), // ✅ This allows empty strings
    email: z.string().email().optional().or(z.literal("")),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .optional(),
  })
  .partial();

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

  role: RoleEnum,

  address: z
    .string()
    .max(200, { message: "can't exceed 200 characters" })
    .optional(),
});
