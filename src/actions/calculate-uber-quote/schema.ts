import { z } from "zod";

export const calculateUberQuoteSchema = z.object({});

export type CalculateUberQuoteSchema = z.infer<typeof calculateUberQuoteSchema>;
