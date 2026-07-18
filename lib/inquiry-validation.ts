import { z } from "zod";

const businessEmail = z.string().trim().email("Enter a valid business email").max(160);
const requiredText = (label: string, max = 160) => z.string().trim().min(2, `${label} is required`).max(max);
const optionalText = (max = 300) => z.string().trim().max(max).optional().or(z.literal(""));

export const quotationSchema = z.object({
  companyName: requiredText("Company name", 120), contactPerson: requiredText("Contact person", 100),
  email: businessEmail, phone: requiredText("Phone or WhatsApp", 50), country: requiredText("Country", 80),
  companyWebsite: optionalText(200), product: requiredText("Product", 100), grade: requiredText("Grade", 100),
  quantity: requiredText("Quantity", 80), packaging: requiredText("Packaging", 120), destinationPort: requiredText("Destination port", 120),
  incoterm: requiredText("Incoterm", 20), sampleRequired: z.enum(["yes", "no"]), notes: optionalText(1500),
  consent: z.boolean().refine(Boolean, "Consent is required"), website: optionalText(100), sourcePage: optionalText(300),
  turnstileToken: optionalText(2048),
});

export const sampleSchema = z.object({
  companyName: requiredText("Company name", 120), contactPerson: requiredText("Contact person", 100), email: businessEmail,
  country: requiredText("Country", 80), product: requiredText("Product", 100), grade: requiredText("Grade", 100),
  intendedUse: requiredText("Intended use", 300), expectedVolume: requiredText("Expected future order volume", 100),
  shippingAddress: requiredText("Shipping address", 500), courierAccount: optionalText(100), notes: optionalText(1200),
  consent: z.boolean().refine(Boolean, "Consent is required"), website: optionalText(100), sourcePage: optionalText(300),
  turnstileToken: optionalText(2048),
});

export const testimonialSchema = z.object({
  name: requiredText("Name", 100),
  company: requiredText("Company", 120),
  role: optionalText(100),
  testimonial: requiredText("Testimonial", 1200).refine((value) => value.length >= 20, "Please share at least 20 characters"),
  consent: z.boolean().refine(Boolean, "Consent is required"),
  website: optionalText(100),
  turnstileToken: optionalText(2048),
});

export type QuotationInput = z.infer<typeof quotationSchema>;
export type SampleInput = z.infer<typeof sampleSchema>;
export type TestimonialInput = z.infer<typeof testimonialSchema>;
