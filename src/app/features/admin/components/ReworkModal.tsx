import { useState } from 'react'
import { RotateCcw, AlertCircle } from 'lucide-react'
import { Modal } from '@/shared/components/ui/Modal'
import { Button } from '@/shared/components/ui/Button'
import type { TaskApi } from '../model/types'

interface ReworkModalProps {
  task: TaskApi
  onClose: () => void
  onSubmit: (note: string) => void
}

export function ReworkModal({ task, onClose, onSubmit }: ReworkModalProps) {
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  return (
    <Modal
      open 
      onClose={onClose}
      title="Send for Rework" 
      subtitle={`Task: ${task.taskName}`} 
      size="sm"
      icon={<RotateCcw size={22} className="text-orange-600" />}
      footer={
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={onClose} className="rounded-xl font-bold">Cancel</Button>
          <Button 
            variant="danger" 
            onClick={async () => { 
              if (!note.trim()) return; 
              setLoading(true); 
              await onSubmit(note); 
              setLoading(false) 
            }}
            loading={loading} 
            disabled={!note.trim()} 
            className="rounded-xl px-6 font-black shadow-lg shadow-orange-500/10"
            icon={<RotateCcw size={14} />}
          >
            Send for Rework
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="p-4 bg-orange-50 border border-orange-200 rounded-2xl flex items-start gap-3">
          <AlertCircle size={18} className="text-orange-600 shrink-0 mt-0.5" />
          <p className="text-[13px] text-orange-900 font-medium leading-relaxed">
            The employee will be notified immediately and the task status will revert to <span className="font-black">Rework Required</span>.
          </p>
        </div>
        <div>
          <label className="text-[11px] font-black text-text-light uppercase tracking-widest block mb-2 px-1">
            Critical Feedback <span className="text-red-500">*</span>
          </label>
          <textarea
            value={note} 
            onChange={e => setNote(e.target.value)} 
            rows={4}
            placeholder="Describe specifically what needs to be revised…"
            className="w-full rounded-3xl border border-[#E5E7EB] bg-white px-4 py-3 text-[14px] text-[#111827] placeholder:text-text-light resize-none focus:outline-none focus:ring-4 focus:ring-primary-olive/5 focus:border-primary-olive transition-all font-medium shadow-sm"
          />
          <div className="flex justify-between items-center mt-2 px-1">
            <p className="text-[10px] text-text-light font-bold uppercase tracking-tighter italic">Required field</p>
            <p className="text-[10px] text-text-light font-black uppercase tracking-tighter">{note.length} characters</p>
          </div>
        </div>
      </div>
    </Modal>
  )
}

