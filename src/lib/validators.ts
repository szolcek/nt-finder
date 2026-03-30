import { z } from "zod";

export const createReviewSchema = z.object({
  locationId: z.number().int().positive(),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(200).optional(),
  body: z.string().max(5000).optional(),
  tip: z.string().max(1000).optional(),
  visitDate: z.string().date().optional(),
});

export const createTripSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  tripDate: z.string().date().optional(),
  status: z.enum(["planned", "visited"]).default("planned"),
});

export const updateTripSchema = createTripSchema.partial();

export const addTripLocationSchema = z.object({
  tripId: z.number().int().positive(),
  locationId: z.number().int().positive(),
  visitOrder: z.number().int().min(0).optional(),
  notes: z.string().max(1000).optional(),
});

export const confirmPhotoSchema = z.object({
  s3Key: z.string().min(1),
  url: z.string().url(),
  caption: z.string().max(500).optional(),
  tripId: z.number().int().positive().optional(),
  locationId: z.number().int().positive().optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  sizeBytes: z.number().int().positive().optional(),
  mimeType: z.string().optional(),
});
