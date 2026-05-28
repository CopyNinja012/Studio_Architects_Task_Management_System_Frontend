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
  const extension = fileName.split('.').pop()?.toLowerCase()
  const isImage = fileType.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'avif'].includes(extension || '')
  const isPdf = fileType === 'application/pdf' || extension === 'pdf'
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = fileUrl
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    link.remove()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="full"
      title="File Preview"
      subtitle={fileName}
      padding="none"
      footer={
        <div className="flex items-center justify-between w-full px-4">
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{fileType} • {extension?.toUpperCase()}</p>
          <div className="flex items-center gap-2">
            {isMobile && isPdf && (
              <Button 
                onClick={() => window.open(fileUrl, '_blank')}
                className="bg-primary-olive text-white h-9 rounded-xl px-4 font-black text-[11px]"
              >
                Full Screen View
              </Button>
            )}
            <Button 
              onClick={handleDownload} 
              icon={<Download size={14} />}
              className="bg-white/10 hover:bg-white/20 text-white border-white/10 h-9 rounded-xl px-6 font-black"
            >
              Download
            </Button>
          </div>
        </div>
      }
    >
      <div className="flex flex-col bg-[#111827] h-full min-h-[80vh]">
        <div className="flex-1 flex items-center justify-center p-2 sm:p-4">
          {isImage ? (
            <img src={fileUrl} alt={fileName} className="max-w-full max-h-[80vh] object-contain shadow-2xl rounded-lg animate-in fade-in zoom-in-95 duration-500" />
          ) : isPdf ? (
            <div className="w-full h-[80vh] relative overflow-hidden rounded-lg shadow-2xl">
              <object
                data={fileUrl}
                type="application/pdf"
                className="w-full h-full border-none"
              >
                <iframe
                  src={`${fileUrl}#toolbar=0`}
                  className="w-full h-full border-none"
                  title={fileName}
                >
                  <div className="flex flex-col items-center justify-center h-full text-white/40 space-y-4">
                    <Maximize2 size={40} />
                    <p className="text-[12px] font-black uppercase tracking-widest">PDF preview not supported</p>
                    <Button onClick={() => window.open(fileUrl, '_blank')} className="bg-primary-olive">Open in New Tab</Button>
                  </div>
                </iframe>
              </object>
            </div>
          ) : (
            <div className="text-center space-y-4 py-20">
              <div className="w-24 h-24 rounded-[32px] bg-white/5 border border-white/10 flex items-center justify-center mx-auto shadow-2xl">
                <Maximize2 size={40} className="text-white/20" />
              </div>
              <div className="space-y-1">
                <p className="text-white text-lg font-black tracking-tight">Preview Restricted</p>
                <p className="text-white/40 text-[11px] font-medium max-w-[200px] mx-auto uppercase tracking-widest leading-relaxed">This file type cannot be rendered directly in the dashboard.</p>
              </div>
              <div className="flex flex-col items-center gap-2 pt-4">
                <Button onClick={() => window.open(fileUrl, '_blank')} className="bg-primary-olive hover:bg-primary-700 text-white rounded-xl px-10 h-10 font-black shadow-xl shadow-primary-olive/20">Open in New Tab</Button>
                <button onClick={handleDownload} className="text-white/40 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors">Or Download Locally</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}
