"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Send, CheckCircle, Edit, Plus, Mail } from "lucide-react"

interface FormData {
  submissionType: string
  resourceType: string
  submitterEmail: string
  submitterName: string
  name: string
  website: string
  description: string
  tags: string
  existingResourceName: string
  updateReason: string
}

export function SubmitResourceSection() {
  const [formData, setFormData] = useState<FormData>({
    submissionType: "",
    resourceType: "",
    submitterEmail: "",
    submitterName: "",
    name: "",
    website: "",
    description: "",
    tags: "",
    existingResourceName: "",
    updateReason: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const isNewResource = formData.submissionType === "new"
    const isEdit = formData.submissionType === "edit"

    if (!formData.submissionType || !formData.resourceType || !formData.submitterEmail || !formData.submitterName) {
      toast({
        title: "Missing Information",
        description: "Please fill in your contact information, submission type, and resource type.",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    if (isNewResource && (!formData.name || !formData.website || !formData.description)) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields for new resource suggestion.",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    if (isEdit && (!formData.existingResourceName || !formData.updateReason)) {
      toast({
        title: "Missing Information",
        description: "Please specify which resource needs updating and what changes are needed.",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    try {
      // In a real app, this would send an email to the site administrators
      const emailData = {
        to: "75devs@gmail.com", // This would be the actual admin email
        subject: isNewResource ? "New Resource Suggestion" : "Resource Update Suggestion",
        submissionType: formData.submissionType,
        submitterName: formData.submitterName,
        submitterEmail: formData.submitterEmail,
        ...formData,
      }

      console.log("Email would be sent with data:", emailData)

      const successMessage = isNewResource
        ? "Your resource suggestion has been sent to our team for review. We'll get back to you soon!"
        : "Your update suggestion has been sent to our team for review. We'll verify and make the changes if needed."

      toast({
        title: isNewResource ? "Suggestion Sent!" : "Update Suggestion Sent!",
        description: successMessage,
      })

      // Reset form
      setFormData({
        submissionType: "",
        resourceType: "",
        submitterEmail: "",
        submitterName: "",
        name: "",
        website: "",
        description: "",
        tags: "",
        existingResourceName: "",
        updateReason: "",
      })
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const isNewResource = formData.submissionType === "new"
  const isEdit = formData.submissionType === "edit"

  return (
    <section id="contact" className="scroll-mt-20">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent graffiti-heading">
          Suggest a Resource
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Know of a great meetup, conference, or learning resource? Help grow Atlanta's tech community by suggesting it!
          You can also suggest updates for existing resources. All suggestions are reviewed by our team.
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <Card className="border-2 hover:border-orange-200 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-orange-500" />
              Resource Suggestion Form
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-muted/30 rounded-lg p-4 space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  Your Contact Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="submitterName">Your Name *</Label>
                    <Input
                      id="submitterName"
                      type="text"
                      placeholder="Your full name"
                      value={formData.submitterName}
                      onChange={(e) => handleInputChange("submitterName", e.target.value)}
                      className="focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="submitterEmail">Your Email *</Label>
                    <Input
                      id="submitterEmail"
                      type="email"
                      placeholder="your.email@example.com"
                      value={formData.submitterEmail}
                      onChange={(e) => handleInputChange("submitterEmail", e.target.value)}
                      className="focus:ring-orange-500 focus:border-orange-500"
                    />
                    <p className="text-xs text-muted-foreground">
                      We'll contact you if we need more information about your suggestion
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="submissionType">What would you like to suggest? *</Label>
                <Select
                  value={formData.submissionType}
                  onValueChange={(value) => handleInputChange("submissionType", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose suggestion type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">
                      <div className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Suggest New Resource
                      </div>
                    </SelectItem>
                    <SelectItem value="edit">
                      <div className="flex items-center gap-2">
                        <Edit className="w-4 h-4" />
                        Suggest Update to Existing Resource
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Resource Type */}
              <div className="space-y-2">
                <Label htmlFor="resourceType">Resource Type *</Label>
                <Select
                  value={formData.resourceType}
                  onValueChange={(value) => handleInputChange("resourceType", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select resource type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="meetup">Meetup Group</SelectItem>
                    <SelectItem value="conference">Tech Conference</SelectItem>
                    <SelectItem value="online">Online Resource</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {isEdit && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="existingResourceName">Existing Resource Name *</Label>
                    <Input
                      id="existingResourceName"
                      type="text"
                      placeholder="e.g., Atlanta JavaScript Meetup"
                      value={formData.existingResourceName}
                      onChange={(e) => handleInputChange("existingResourceName", e.target.value)}
                      className="focus:ring-orange-500 focus:border-orange-500"
                    />
                    <p className="text-sm text-muted-foreground">
                      Enter the exact name of the resource that needs updating
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="updateReason">What needs to be updated? *</Label>
                    <Textarea
                      id="updateReason"
                      placeholder="e.g., The website link is broken, the group has moved to a new location, the description is outdated, the group no longer exists..."
                      value={formData.updateReason}
                      onChange={(e) => handleInputChange("updateReason", e.target.value)}
                      className="focus:ring-orange-500 focus:border-orange-500 min-h-[100px]"
                    />
                    <p className="text-sm text-muted-foreground">
                      Please be as specific as possible about what needs to be changed
                    </p>
                  </div>
                </>
              )}

              {(isNewResource || isEdit) && (
                <>
                  {/* Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name">{isEdit ? "Updated Name (if applicable)" : "Resource Name *"}</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="e.g., Atlanta JavaScript Meetup"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className="focus:ring-orange-500 focus:border-orange-500"
                    />
                    {isEdit && (
                      <p className="text-sm text-muted-foreground">Only fill this if the name should be changed</p>
                    )}
                  </div>

                  {/* Website */}
                  <div className="space-y-2">
                    <Label htmlFor="website">
                      {isEdit ? "Correct Website Link (if applicable)" : "Website Link *"}
                    </Label>
                    <Input
                      id="website"
                      type="url"
                      placeholder="https://example.com"
                      value={formData.website}
                      onChange={(e) => handleInputChange("website", e.target.value)}
                      className="focus:ring-orange-500 focus:border-orange-500"
                    />
                    {isEdit && (
                      <p className="text-sm text-muted-foreground">
                        Provide the correct website link if it needs updating
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">
                      {isEdit ? "Updated Description (if applicable)" : "Description *"}
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Brief description of the resource (1-2 sentences)"
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      className="focus:ring-orange-500 focus:border-orange-500 min-h-[100px]"
                    />
                    {isEdit && (
                      <p className="text-sm text-muted-foreground">Only fill this if the description needs updating</p>
                    )}
                  </div>

                  {/* Tags */}
                  <div className="space-y-2">
                    <Label htmlFor="tags">{isEdit ? "Updated Tags (if applicable)" : "Tags"}</Label>
                    <Input
                      id="tags"
                      type="text"
                      placeholder="e.g., JavaScript, React, Frontend (comma-separated)"
                      value={formData.tags}
                      onChange={(e) => handleInputChange("tags", e.target.value)}
                      className="focus:ring-orange-500 focus:border-orange-500"
                    />
                    <p className="text-sm text-muted-foreground">
                      {isEdit
                        ? "Only fill this if tags need updating. Separate multiple tags with commas"
                        : "Separate multiple tags with commas"}
                    </p>
                  </div>
                </>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium py-3"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Sending Suggestion...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Suggestion
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <div className="mt-8 bg-muted/50 rounded-lg p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Mail className="w-5 h-5 text-orange-500" />
            <h3 className="text-lg font-semibold">How It Works</h3>
          </div>
          <p className="text-muted-foreground mb-4">
            Your suggestions are sent directly to our team via email for review. We manually verify all information and
            make updates to ensure quality and accuracy. This helps us maintain a trusted resource for the Atlanta tech
            community.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Typical response time: 2-3 business days</span>
          </div>
        </div>
      </div>
    </section>
  )
}
