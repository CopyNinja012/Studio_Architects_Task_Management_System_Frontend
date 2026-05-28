import { 
  PlusCircle
} from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'

export default function HRRecruitment() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
      <div className="text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-primary-olive/10 flex items-center justify-center mx-auto mb-8 transition-transform hover:scale-110 duration-500">
           <PlusCircle size={40} className="text-primary-olive" />
        </div>
        <h2 className="text-3xl font-black text-text-dark tracking-tight">Recruitment Portal</h2>
        <p className="text-text-light font-medium max-w-sm mx-auto">
          Manage your organizational growth. Click below to initiate a new job listing for the studio.
        </p>
        <div className="pt-4">
          <Button 
            variant="primary" 
            size="lg" 
            className="h-14 px-10 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-primary-olive/20 hover:-translate-y-1 transition-all"
          >
            <PlusCircle size={18} className="mr-3" /> Post New Job
          </Button>
        </div>
      </div>
    </div>
  )
}
