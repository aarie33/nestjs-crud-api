import { z, ZodType } from 'zod';

export class PostValidation {
  static readonly CREATE: ZodType = z.object({
    title: z.string().min(1).max(100),
    content: z.string().min(1).max(10000),
    published: z.boolean().optional(),
  });

  static readonly UPDATE: ZodType = z.object({
    id: z.number().positive(),
    title: z.string().min(1).max(100).optional(),
    content: z.string().min(1).max(10000).optional(),
    published: z.boolean().optional(),
  });

  static readonly SEARCH: ZodType = z.object({
    title: z.string().min(1).max(100).optional(),
    content: z.string().min(1).max(10000).optional(),
    page: z.number().min(1).positive(),
    size: z.number().min(1).max(100).positive(),
  });
}
