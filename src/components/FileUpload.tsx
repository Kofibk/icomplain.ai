'use client'

import { useRef } from 'react'
import { Upload, X, FileText } from 'lucide-react'

interface FileUploadProps {
  files: File[]
  onChange: (files: File[]) => void
  helpText?: string
  dark?: boolean
}

export default function FileUpload({ files, onChange, helpText, dark = false }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles) return
    const fileArray = Array.from(newFiles)
    const validFiles = fileArray.filter(f => 
      f.size <= 10 * 1024 * 1024 && 
      ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(f.type)
    )
    onChange([...files, ...validFiles])
  }

  const removeFile = (index: number) => {
    onChange(files.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-3">
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files) }}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
          dark
            ? 'border-white/10 hover:border-white/20 bg-white/[0.02]'
            : 'border-gray-200 hover:border-gray-300 bg-gray-50'
        }`}
      >
        <Upload className={`w-8 h-8 mx-auto mb-2 ${dark ? 'text-white/30' : 'text-gray-400'}`} />
        <p className={`text-sm ${dark ? 'text-white/50' : 'text-gray-600'}`}>
          Click or drag files here
        </p>
        {helpText && (
          <p className={`text-xs mt-1 ${dark ? 'text-white/30' : 'text-gray-400'}`}>{helpText}</p>
        )}
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, i) => (
            <div key={i} className={`flex items-center gap-3 p-3 rounded-lg ${dark ? 'bg-white/5' : 'bg-gray-100'}`}>
              <FileText className={`w-5 h-5 ${dark ? 'text-white/40' : 'text-gray-500'}`} />
              <span className={`flex-1 text-sm truncate ${dark ? 'text-white/70' : 'text-gray-700'}`}>{file.name}</span>
              <button
                type="button"
                onClick={() => removeFile(i)}
                className={dark ? 'text-white/40 hover:text-white/70' : 'text-gray-400 hover:text-gray-600'}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
