"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { leadFormSchema, LeadFormData } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import {
  HiX,
  HiCheckCircle,
  HiUser,
  HiMail,
  HiPhone,
  HiBriefcase,
  HiChatAlt,
  HiPencilAlt,
} from "react-icons/hi";
import { Loader2 } from "lucide-react";

interface LeadFormProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export function LeadForm({ onClose, onSuccess }: LeadFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadFormSchema),
  });

  const onSubmit = async (data: LeadFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit lead");
      }

      setSubmitSuccess(true);
      reset();

      // Show success message for 2 seconds then close
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 2000);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Failed to submit lead"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="bg-linear-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-900/20 dark:via-emerald-900/20 dark:to-teal-900/20 rounded-2xl border-2 border-green-200 dark:border-green-800 p-8 sm:p-10 animate-fadeIn">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-500 rounded-full flex items-center justify-center">
            <HiCheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Thank You!
            </h3>
            <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300 max-w-md">
              Your information has been submitted successfully.
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              We'll get back to you soon!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-fadeIn">
      {/* Header */}
      <div className="p-5 sm:p-6 border-b border-gray-200 dark:border-gray-700 bg-linear-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <HiPencilAlt className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                Get in Touch
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Fill out the form below and we'll contact you shortly
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/50 dark:hover:bg-gray-700 transition-colors shrink-0 ml-2"
            aria-label="Close"
          >
            <HiX className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="p-5 sm:p-6 space-y-5">
        {submitError && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-lg">
            <p className="text-sm font-medium text-red-800 dark:text-red-200">
              ⚠️ {submitError}
            </p>
          </div>
        )}

        {/* Name */}
        <div className="space-y-2">
          <Label
            htmlFor="name"
            className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2"
          >
            <HiUser className="w-4 h-4 text-gray-500" />
            Full Name *
          </Label>
          <Input
            id="name"
            {...register("name")}
            placeholder="Enter your full name"
            className="h-11"
            disabled={isSubmitting}
          />
          {errors.name && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-1.5">
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label
            htmlFor="email"
            className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2"
          >
            <HiMail className="w-4 h-4 text-gray-500" />
            Email Address *
          </Label>
          <Input
            id="email"
            type="email"
            {...register("email")}
            placeholder="your.email@example.com"
            className="h-11"
            disabled={isSubmitting}
          />
          {errors.email && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-1.5">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label
            htmlFor="phone"
            className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2"
          >
            <HiPhone className="w-4 h-4 text-gray-500" />
            Phone Number *
          </Label>
          <Input
            id="phone"
            type="tel"
            {...register("phone")}
            placeholder="+92 300 1234567"
            className="h-11"
            disabled={isSubmitting}
          />
          {errors.phone && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-1.5">
              {errors.phone.message}
            </p>
          )}
        </div>

        {/* Subject */}
        <div className="space-y-2">
          <Label
            htmlFor="subject"
            className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2"
          >
            <HiBriefcase className="w-4 h-4 text-gray-500" />
            Subject *
          </Label>
          <Input
            id="subject"
            {...register("subject")}
            placeholder="What can we help you with?"
            className="h-11"
            disabled={isSubmitting}
          />
          {errors.subject && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-1.5">
              {errors.subject.message}
            </p>
          )}
        </div>

        {/* Message */}
        <div className="space-y-2">
          <Label
            htmlFor="message"
            className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2"
          >
            <HiChatAlt className="w-4 h-4 text-gray-500" />
            Message *
          </Label>
          <Textarea
            id="message"
            {...register("message")}
            placeholder="Tell us more about your requirements..."
            rows={4}
            className="text-sm resize-none"
            disabled={isSubmitting}
          />
          {errors.message && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-1.5">
              {errors.message.message}
            </p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3 pt-3">
          <Button
            type="submit"
            className="w-full h-12 bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <span>Submit Form</span>
                <span className="ml-2">→</span>
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="w-full h-11 text-sm border-2"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
