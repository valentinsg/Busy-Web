"use client"

import { supabase } from "@/lib/supabase/client"
import Image from "next/image"
import { useRef, useState } from "react"

interface NewsletterImageUploadProps {
  onImageUploaded: (url: string, markdown: string) => void
  disabled?: boolean
}

export function NewsletterImageUpload({ onImageUploaded, disabled }: NewsletterImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Solo se permiten imágenes')
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('La imagen debe ser menor a 2MB')
      return
    }

    setUploading(true)
    setError(null)

    try {
      // Generate unique filename
      const ext = file.name.split('.').pop()
      const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`
      const path = `campaigns/${filename}`

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('newsletter')
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('newsletter')
        .getPublicUrl(path)

      // Generate markdown
      const markdown = `![${file.name}](${publicUrl})`

      setPreview(publicUrl)
      onImageUploaded(publicUrl, markdown)

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (err) {
      console.error('Upload error:', err)
      setError(err instanceof Error ? err.message : 'Error al subir imagen')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleUpload}
          disabled={disabled || uploading}
          className="hidden"
          id="newsletter-image-upload"
        />
        <label
          htmlFor="newsletter-image-upload"
          className={`
            inline-flex items-center gap-2 px-3 py-1.5 text-xs border rounded cursor-pointer
            hover:bg-muted transition-colors
            ${disabled || uploading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {uploading ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Subiendo...
            </>
          ) : (
            <>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Subir imagen
            </>
          )}
        </label>
        <span className="text-xs text-muted-foreground">Max 2MB · JPG, PNG, GIF, WebP</span>
      </div>

      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}

      {preview && (
        <div className="relative inline-block">
          <Image
            src={preview}
            alt="Preview"
            width={120}
            height={80}
            className="rounded border object-cover"
          />
          <button
            type="button"
            onClick={() => setPreview(null)}
            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600"
          >
            ×
          </button>
        </div>
      )}
    </div>
  )
}
