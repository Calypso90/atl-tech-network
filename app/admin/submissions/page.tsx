'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { CheckCircle, XCircle, Clock, ExternalLink, RefreshCw } from 'lucide-react'

interface Submission {
  id: number
  submission_type: 'new' | 'edit'
  resource_type: string
  submitter_name: string
  submitter_email: string
  status: 'pending' | 'approved' | 'rejected'
  name: string | null
  website: string | null
  description: string | null
  tags: string | null
  existing_resource_name: string | null
  update_reason: string | null
  created_at: string
  reviewed_at: string | null
  admin_notes: string | null
}

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected'>('pending')
  const [reviewingId, setReviewingId] = useState<number | null>(null)
  const [adminNotes, setAdminNotes] = useState('')

  const fetchSubmissions = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/admin/submissions?status=${filter}`)
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      setSubmissions(data.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load submissions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSubmissions()
  }, [filter])

  const handleReview = async (id: number, status: 'approved' | 'rejected') => {
    try {
      const response = await fetch(`/api/admin/submissions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, adminNotes: adminNotes || undefined })
      })

      if (!response.ok) throw new Error('Failed to update')

      // Remove from list
      setSubmissions(prev => prev.filter(s => s.id !== id))
      setReviewingId(null)
      setAdminNotes('')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update submission')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Submission Review</h1>
        <Button onClick={fetchSubmissions} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {(['pending', 'approved', 'rejected'] as const).map((status) => (
          <Button
            key={status}
            variant={filter === status ? 'default' : 'outline'}
            onClick={() => setFilter(status)}
            className="capitalize"
          >
            {status === 'pending' && <Clock className="w-4 h-4 mr-2" />}
            {status === 'approved' && <CheckCircle className="w-4 h-4 mr-2" />}
            {status === 'rejected' && <XCircle className="w-4 h-4 mr-2" />}
            {status}
          </Button>
        ))}
      </div>

      {loading && (
        <div className="text-center py-12 text-muted-foreground">
          Loading submissions...
        </div>
      )}

      {error && (
        <div className="text-center py-12 text-red-500">
          {error}
        </div>
      )}

      {!loading && !error && submissions.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No {filter} submissions found.
        </div>
      )}

      <div className="space-y-4">
        {submissions.map((submission) => (
          <Card key={submission.id} className="overflow-hidden">
            <CardHeader className="bg-muted/30">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {submission.submission_type === 'new' ? (
                      <Badge variant="default">New Resource</Badge>
                    ) : (
                      <Badge variant="secondary">Edit Request</Badge>
                    )}
                    <Badge variant="outline">{submission.resource_type}</Badge>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    From: {submission.submitter_name} ({submission.submitter_email})
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Submitted: {formatDate(submission.created_at)}
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-4">
              {submission.submission_type === 'new' ? (
                <div className="space-y-2">
                  <p><strong>Name:</strong> {submission.name}</p>
                  <p>
                    <strong>Website:</strong>{' '}
                    <a
                      href={submission.website || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline inline-flex items-center gap-1"
                    >
                      {submission.website}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </p>
                  <p><strong>Description:</strong> {submission.description}</p>
                  {submission.tags && <p><strong>Tags:</strong> {submission.tags}</p>}
                </div>
              ) : (
                <div className="space-y-2">
                  <p><strong>Resource:</strong> {submission.existing_resource_name}</p>
                  <p><strong>Update Reason:</strong> {submission.update_reason}</p>
                  {submission.name && <p><strong>New Name:</strong> {submission.name}</p>}
                  {submission.website && <p><strong>New Website:</strong> {submission.website}</p>}
                  {submission.description && <p><strong>New Description:</strong> {submission.description}</p>}
                </div>
              )}

              {filter === 'pending' && (
                <div className="mt-6 pt-4 border-t">
                  {reviewingId === submission.id ? (
                    <div className="space-y-4">
                      <Textarea
                        placeholder="Admin notes (optional)"
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleReview(submission.id, 'approved')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          onClick={() => handleReview(submission.id, 'rejected')}
                          variant="destructive"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                        <Button
                          onClick={() => {
                            setReviewingId(null)
                            setAdminNotes('')
                          }}
                          variant="outline"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button onClick={() => setReviewingId(submission.id)}>
                      Review This Submission
                    </Button>
                  )}
                </div>
              )}

              {submission.admin_notes && (
                <div className="mt-4 p-3 bg-muted rounded text-sm">
                  <strong>Admin Notes:</strong> {submission.admin_notes}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
