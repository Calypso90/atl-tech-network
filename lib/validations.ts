/**
 * Zod Validation Schemas
 *
 * Shared validation schemas for API routes and forms.
 */

import { z } from 'zod'

// Resource types enum
export const resourceTypes = ['meetup', 'conference', 'online', 'tech-hub'] as const
export type ResourceType = typeof resourceTypes[number]

// Submission types enum
export const submissionTypes = ['new', 'edit'] as const
export type SubmissionType = typeof submissionTypes[number]

/**
 * Submission form validation schema
 */
export const submissionSchema = z.object({
  submissionType: z.enum(submissionTypes, {
    errorMap: () => ({ message: 'Please select a submission type' })
  }),
  resourceType: z.enum(resourceTypes, {
    errorMap: () => ({ message: 'Please select a resource type' })
  }),
  submitterName: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .trim(),
  submitterEmail: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(254, 'Email must be less than 254 characters')
    .toLowerCase()
    .trim(),

  // New resource fields (required for 'new' type)
  name: z
    .string()
    .max(200, 'Name must be less than 200 characters')
    .trim()
    .optional(),
  website: z
    .string()
    .url('Please enter a valid URL')
    .max(500, 'URL must be less than 500 characters')
    .optional()
    .or(z.literal('')),
  description: z
    .string()
    .max(1000, 'Description must be less than 1000 characters')
    .trim()
    .optional(),
  tags: z
    .string()
    .max(500, 'Tags must be less than 500 characters')
    .trim()
    .optional(),

  // Edit request fields (required for 'edit' type)
  existingResourceName: z
    .string()
    .max(200, 'Resource name must be less than 200 characters')
    .trim()
    .optional(),
  updateReason: z
    .string()
    .max(1000, 'Update reason must be less than 1000 characters')
    .trim()
    .optional()
}).refine(
  (data) => {
    // For 'new' submissions, require name, website, and description
    if (data.submissionType === 'new') {
      return data.name && data.website && data.description
    }
    return true
  },
  {
    message: 'Name, website, and description are required for new resource submissions',
    path: ['name']
  }
).refine(
  (data) => {
    // For 'edit' submissions, require existingResourceName and updateReason
    if (data.submissionType === 'edit') {
      return data.existingResourceName && data.updateReason
    }
    return true
  },
  {
    message: 'Resource name and update reason are required for edit submissions',
    path: ['existingResourceName']
  }
)

export type SubmissionInput = z.infer<typeof submissionSchema>

/**
 * Admin review schema
 */
export const reviewSchema = z.object({
  status: z.enum(['approved', 'rejected'], {
    errorMap: () => ({ message: 'Status must be approved or rejected' })
  }),
  adminNotes: z
    .string()
    .max(500, 'Notes must be less than 500 characters')
    .trim()
    .optional()
})

export type ReviewInput = z.infer<typeof reviewSchema>

/**
 * Resource query parameters
 */
export const resourceQuerySchema = z.object({
  type: z.enum(resourceTypes).optional(),
  search: z.string().max(100).optional(),
  limit: z.coerce.number().min(1).max(100).optional().default(100),
  offset: z.coerce.number().min(0).optional().default(0)
})

export type ResourceQuery = z.infer<typeof resourceQuerySchema>
