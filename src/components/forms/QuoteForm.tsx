"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
// import { Select } from "@/components/ui/select";
// import { addQuoteRequest } from "@/lib/firestore";

// Form schema using zod for validation
const quoteFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters" })
    .max(50, { message: "Name cannot exceed 50 characters" }),
  email: z
    .string()
    .email({ message: "Please enter a valid email address" }),
  company: z
    .string()
    .max(100, { message: "Company name cannot exceed 100 characters" })
    .optional(),
  phone: z
    .string()
    .max(20, { message: "Phone number cannot exceed 20 characters" })
    .optional(),
  projectType: z
    .enum(["website", "ecommerce", "consultation", "other"], {
      required_error: "Please select a project type",
    }),
  description: z
    .string()
    .min(10, { message: "Description must be at least 10 characters" })
    .max(500, { message: "Description cannot exceed 500 characters" }),
  budget: z
    .string()
    .max(100, { message: "Budget cannot exceed 100 characters" })
    .optional(),
  timeline: z
    .string()
    .max(100, { message: "Timeline cannot exceed 100 characters" })
    .optional(),
});

type QuoteFormValues = z.infer<typeof quoteFormSchema>;

export function QuoteForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteFormSchema),
    defaultValues: {
      name: "",
      email: "",
      company: "",
      phone: "",
      projectType: undefined,
      description: "",
      budget: "",
      timeline: "",
    },
  });

  async function onSubmit(data: QuoteFormValues) {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      console.log("Submitting quote request data:", data);
      
      // Use fetch to call the API route instead of direct Firestore access
      const response = await fetch('/api/quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          company: data.company,
          phone: data.phone,
          projectType: data.projectType,
          message: data.description, // API expects 'message' not 'description'
          budget: data.budget,
          timeline: data.timeline
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit quote');
      }

      const result = await response.json();
      console.log("Successfully submitted quote request with ID:", result.requestId);

      // Success
      setIsSubmitted(true);
      reset();
    } catch (error) {
      console.error("Error submitting quote request:", error);
      setSubmitError("Failed to submit quote request. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSubmitted) {
    return (
      <div className="bg-primary/10 p-6 rounded-lg text-center">
        <h3 className="text-xl font-medium mb-2">Thank you for your request!</h3>
        <p className="mb-4">We&apos;ve received your quote request and will get back to you within 1-2 business days.</p>
        <Button onClick={() => setIsSubmitted(false)} variant="outline">Submit another request</Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {submitError && (
        <div className="p-4 mb-4 text-sm text-destructive bg-destructive/10 rounded-lg" role="alert">
          <span className="font-medium">Error:</span> {submitError}
        </div>
      )}

      <div className="space-y-4">
        {/* Name Field */}
        <div className="space-y-2">
          <Label htmlFor="name">
            Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            placeholder="Your full name"
            {...register("name")}
            aria-invalid={errors.name ? "true" : "false"}
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>

        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email">
            Email <span className="text-destructive">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="your.email@example.com"
            {...register("email")}
            aria-invalid={errors.email ? "true" : "false"}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        {/* Company Field */}
        <div className="space-y-2">
          <Label htmlFor="company">Company Name</Label>
          <Input
            id="company"
            placeholder="Your company (if applicable)"
            {...register("company")}
            aria-invalid={errors.company ? "true" : "false"}
          />
          {errors.company && (
            <p className="text-sm text-destructive">{errors.company.message}</p>
          )}
        </div>

        {/* Phone Field */}
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            placeholder="Your phone number"
            {...register("phone")}
            aria-invalid={errors.phone ? "true" : "false"}
          />
          {errors.phone && (
            <p className="text-sm text-destructive">{errors.phone.message}</p>
          )}
        </div>

        {/* Project Type Field */}
        <div className="space-y-2">
          <Label htmlFor="projectType">
            Project Type <span className="text-destructive">*</span>
          </Label>
          <select
            id="projectType"
            className="w-full h-10 px-3 py-2 text-sm border rounded-md bg-background"
            {...register("projectType")}
            aria-invalid={errors.projectType ? "true" : "false"}
          >
            <option value="">Select a project type</option>
            <option value="website">Website Development</option>
            <option value="ecommerce">E-commerce Solution</option>
            <option value="consultation">Consultation/Advisory</option>
            <option value="other">Other</option>
          </select>
          {errors.projectType && (
            <p className="text-sm text-destructive">{errors.projectType.message}</p>
          )}
        </div>

        {/* Description Field */}
        <div className="space-y-2">
          <Label htmlFor="description">
            Project Description <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="description"
            placeholder="Please describe your project requirements in detail"
            rows={5}
            {...register("description")}
            aria-invalid={errors.description ? "true" : "false"}
          />
          {errors.description && (
            <p className="text-sm text-destructive">{errors.description.message}</p>
          )}
        </div>

        {/* Budget Field */}
        <div className="space-y-2">
          <Label htmlFor="budget">Budget Range</Label>
          <select
            id="budget"
            className="w-full h-10 px-3 py-2 text-sm border rounded-md bg-background"
            {...register("budget")}
            aria-invalid={errors.budget ? "true" : "false"}
          >
            <option value="">Select a budget range</option>
            <option value="less-than-5k">Less than $5,000</option>
            <option value="5k-10k">$5,000 - $10,000</option>
            <option value="10k-25k">$10,000 - $25,000</option>
            <option value="25k-50k">$25,000 - $50,000</option>
            <option value="50k+">$50,000+</option>
            <option value="not-sure">Not sure yet</option>
          </select>
          {errors.budget && (
            <p className="text-sm text-destructive">{errors.budget.message}</p>
          )}
        </div>

        {/* Timeline Field */}
        <div className="space-y-2">
          <Label htmlFor="timeline">Preferred Timeline</Label>
          <select
            id="timeline"
            className="w-full h-10 px-3 py-2 text-sm border rounded-md bg-background"
            {...register("timeline")}
            aria-invalid={errors.timeline ? "true" : "false"}
          >
            <option value="">Select a preferred timeline</option>
            <option value="urgent">Urgent (ASAP)</option>
            <option value="1-month">Within 1 month</option>
            <option value="1-3-months">1-3 months</option>
            <option value="3-6-months">3-6 months</option>
            <option value="flexible">Flexible</option>
          </select>
          {errors.timeline && (
            <p className="text-sm text-destructive">{errors.timeline.message}</p>
          )}
        </div>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Submitting..." : "Submit Quote Request"}
      </Button>
    </form>
  );
} 