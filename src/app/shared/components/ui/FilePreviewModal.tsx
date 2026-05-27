import { X, Download, Maximize2 } from 'lucide-react'
import { Modal } from './Modal'
import { Button } from './Button'

interface Props {
  open: boolean
  onClose: () => void
  fileUrl: string
  fileName: string
  fileType: string
}

export function FilePreviewModal({ open, onClose, fileUrl, fileName, fileType }: Props) {
  const isImage = fileType.startsWith('image/')
  const isPdf = fileType === 'application/pdf'

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="xl"
      title="File Preview"
      subtitle={fileName}
      padding="none"
    >
      <div className="flex flex-col bg-[#111827] min-h-[70vh]">
        <div className="flex-1 flex items-center justify-center p-4">
          {isImage ? (
            <img src={fileUrl} alt={fileName} className="max-w-full max-h-[75vh] object-contain shadow-2xl rounded-lg" />
          ) : isPdf ? (
            <iframe src={`${fileUrl}#toolbar=0`} className="w-full h-[75vh] rounded-lg shadow-2xl" title={fileName} />
          ) : (
            <div className="text-center space-y-4 py-20">
              <div className="w-20 h-20 rounded-3xl bg-white/10 flex items-center justify-center mx-auto">
                <Maximize2 size={40} className="text-white/40" />
              </div>
              <p className="text-white font-bold">Preview not available for this file type</p>
              <Button onClick={() => window.open(fileUrl, '_blank')} className="bg-primary-olive">Open in New Tab</Button>
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}
