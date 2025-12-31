'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, File, X, Check, Loader2 } from 'lucide-react'

interface FileUploadProps {
  files: File[]
  onChange: (files: File[]) => void
  helpText?: string
  accept?: string
  maxFiles?: number
}

export default function FileUpload({
  files,
  onChange,
  helpText = 'Drag and drop files here, or click to browse',
  accept = '.pdf,.jpg,.jpeg,.png,.doc,.docx',
  maxFiles = 5,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const droppedFiles = Array.from(e.dataTransfer.files)
    const newFiles = [...files, ...droppedFiles].slice(0, maxFiles)
    onChange(newFiles)
  }, [files, onChange, maxFiles])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files)
      const newFiles = [...files, ...selectedFiles].slice(0, maxFiles)
      onChange(newFiles)
    }
  }, [files, onChange, maxFiles])

  const removeFile = useCallback((index: number) => {
    const newFiles = files.filter((_, i) => i !== index)
    onChange(newFiles)
  }, [files, onChange])

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`drop-zone border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-green-500 bg-green-50 dragging'
            : 'border-gray-300 hover:border-gray-400 bg-gray-50'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={accept}
          onChange={handleChange}
          className="hidden"
        />
        <Upload className={`w-10 h-10 mx-auto mb-4 ${isDragging ? 'text-green-600' : 'text-gray-400'}`} />
        <p className={`font-medium ${isDragging ? 'text-green-900' : 'text-gray-700'}`}>
          {isDragging ? 'Drop files here' : 'Drag and drop files here'}
        </p>
        <p className="text-sm text-gray-500 mt-1">or click to browse</p>
        <p className="text-xs text-gray-400 mt-2">{helpText}</p>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${index}`}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
            >
              <File className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  removeFile(index)
                }}
                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {files.length > 0 && files.length < maxFiles && (
        <p className="text-xs text-gray-400 text-center">
          {maxFiles - files.length} more file{maxFiles - files.length !== 1 ? 's' : ''} allowed
        </p>
      )}
    </div>
  )
}
