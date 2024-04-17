import { z, ZodType } from 'zod';

export class CommentValidation {
  static readonly CREATE: ZodType = z.object({
    post_id: z.number().positive(),
    content: z.string().min(1).max(10000),
  });

  static readonly UPDATE: ZodType = z.object({
    id: z.number().positive(),
    content: z.string().min(1).max(10000).optional(),
  });

  static readonly SEARCH: ZodType = z.object({
    post_id: z.number().positive(),
    search: z.string().max(100).optional(),
    page: z.number().min(1).positive(),
    size: z.number().min(1).max(100).positive(),
  });
}
