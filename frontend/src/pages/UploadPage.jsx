import { useState, useRef } from 'react'
import { Camera, Upload, X, CheckCircle, Search, Zap, FileImage, AlertCircle } from 'lucide-react'
import { uploadImage } from '../api'
import PartCard from '../components/PartCard'
import { PageHeader, LoadingSpinner } from '../components/UI'

export default function UploadPage() {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [dragging, setDragging] = useState(false)
  const fileInputRef = useRef()

  const handleFile = (f) => {
    if (!f) return
    if (!f.type.startsWith('image/')) {
      setError('Please upload an image file (PNG, JPG, JPEG, BMP, TIFF)')
      return
    }
    setFile(f)
    setError('')
    setResult(null)
    const reader = new FileReader()
    reader.onloadend = () => setPreview(reader.result)
    reader.readAsDataURL(f)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const dropped = e.dataTransfer.files[0]
    handleFile(dropped)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) { setError('Please select an image first'); return }
    setLoading(true); setError('')
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await uploadImage(form)
      setResult(res.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setFile(null); setPreview(null); setResult(null); setError('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div>
      <PageHeader
        title="Upload Spare Image"
        subtitle="Take a photo of your spare part – our OCR will identify it instantly"
        icon={Camera}
        breadcrumb="Home / Upload Image"
      />

      <div className="page-container max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {[
            { icon: Camera, title: 'Photo Recognition', desc: 'Upload any photo of your spare part' },
            { icon: Search, title: 'Text Extraction', desc: 'OCR reads part numbers from labels' },
            { icon: Zap, title: 'Instant Match', desc: 'Finds matching parts in our database' },
            { icon: CheckCircle, title: 'Smart Results', desc: 'Shows price, availability, and details' },
          ].map((f, i) => (
            <div key={i} className="glass-card p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-electric-500/10 border border-electric-500/20 flex items-center justify-center shrink-0">
                <f.icon className="w-6 h-6 text-electric-400" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{f.title}</p>
                <p className="text-gray-400 text-xs">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Upload Area */}
        <form onSubmit={handleSubmit} className="glass-card p-8 mb-8">
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={e => handleFile(e.target.files[0])}
            className="hidden"
            id="file-input"
          />

          {!preview ? (
            <label
              htmlFor="file-input"
              onDragOver={e => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-16 flex flex-col items-center justify-center cursor-pointer transition-all ${
                dragging
                  ? 'border-electric-400 bg-electric-500/10'
                  : 'border-white/20 hover:border-electric-500/50 hover:bg-white/3'
              }`}
            >
              <div className="w-20 h-20 rounded-2xl bg-electric-500/10 border border-electric-500/20 flex items-center justify-center mb-5">
                <Upload className="w-10 h-10 text-electric-400" />
              </div>
              <p className="text-white font-semibold text-lg mb-2">Drop your image here</p>
              <p className="text-gray-400 text-sm mb-4">or click to browse files</p>
              <div className="flex gap-2">
                {['PNG', 'JPG', 'JPEG', 'BMP', 'TIFF'].map(fmt => (
                  <span key={fmt} className="badge bg-white/5 border border-white/10 text-gray-400 text-xs">{fmt}</span>
                ))}
              </div>
              <p className="text-gray-500 text-xs mt-4">Maximum file size: 16MB</p>
            </label>
          ) : (
            <div className="relative">
              <div className="rounded-2xl overflow-hidden border border-white/10 mb-4">
                <img src={preview} alt="Preview" className="w-full max-h-80 object-contain bg-navy-900" />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileImage className="w-5 h-5 text-electric-400" />
                  <div>
                    <p className="text-white text-sm font-medium">{file.name}</p>
                    <p className="text-gray-400 text-xs">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <button type="button" onClick={reset} className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 transition-all">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={!file || loading}
            className="mt-6 w-full btn-primary py-4 text-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
                Processing with OCR...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Identify Spare Part
              </>
            )}
          </button>
        </form>

        {/* Results */}
        {result && (
          <div className="animate-fade-in space-y-6">
            {/* OCR Status */}
            <div className={`glass-card p-5 border ${result.ocr_available ? 'border-green-500/30 bg-green-500/5' : 'border-orange-500/30 bg-orange-500/5'}`}>
              <div className="flex items-center gap-3 mb-3">
                {result.ocr_available ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-orange-400" />
                )}
                <p className={`font-semibold ${result.ocr_available ? 'text-green-300' : 'text-orange-300'}`}>
                  {result.ocr_available ? 'OCR Processing Successful' : 'Tesseract OCR Not Available'}
                </p>
              </div>
              {!result.ocr_available && (
                <p className="text-gray-400 text-sm mb-3">
                  Install Tesseract OCR to enable automatic text extraction from images.
                  <br />Run: <code className="bg-white/10 px-2 py-0.5 rounded text-electric-300">choco install tesseract</code> or download from GitHub.
                </p>
              )}
              {result.detected_part_numbers?.length > 0 && (
                <div>
                  <p className="text-gray-400 text-xs mb-2">Detected part numbers:</p>
                  <div className="flex flex-wrap gap-2">
                    {result.detected_part_numbers.map(pn => (
                      <span key={pn} className="badge-blue font-mono text-sm">{pn}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Extracted Text */}
            {result.extracted_text && result.ocr_available && (
              <div className="glass-card p-5">
                <p className="text-gray-400 text-sm font-semibold mb-3">Raw OCR Output:</p>
                <pre className="text-gray-300 text-xs bg-white/3 rounded-xl p-4 overflow-x-auto whitespace-pre-wrap font-mono">
                  {result.extracted_text || 'No text detected in image'}
                </pre>
              </div>
            )}

            {/* Matched Parts */}
            {result.matched_parts?.length > 0 ? (
              <div>
                <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  Matched {result.matched_parts.length} Part{result.matched_parts.length !== 1 ? 's' : ''}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {result.matched_parts.map(part => <PartCard key={part.id} part={part} />)}
                </div>
              </div>
            ) : (
              <div className="glass-card p-10 text-center">
                <Search className="w-14 h-14 text-gray-500 mx-auto mb-4" />
                <p className="text-white font-semibold mb-2">No exact matches found</p>
                <p className="text-gray-400 text-sm mb-4">Try our manual search to find your part.</p>
                <a href="/search" className="btn-primary inline-flex items-center gap-2 text-sm">
                  <Search className="w-4 h-4" /> Search Manually
                </a>
              </div>
            )}

            <button onClick={reset} className="btn-secondary w-full flex items-center justify-center gap-2">
              <Upload className="w-4 h-4" /> Upload Another Image
            </button>
          </div>
        )}

        {/* Instructions */}
        {!result && (
          <div className="glass-card p-6">
            <h3 className="text-white font-semibold mb-4">Tips for Best Results</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                'Ensure the part label or number is clearly visible',
                'Take the photo in good lighting conditions',
                'Include the entire part label in the frame',
                'Avoid blurry or low-resolution images',
                'Show any stickers with part numbers or codes',
                'Clean the part to make markings more visible',
              ].map((tip, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-electric-400 mt-0.5 shrink-0" />
                  <p className="text-gray-400 text-sm">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
