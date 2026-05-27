import { Users } from 'lucide-react'
import { Card } from '@/shared/components/ui/Card'

export default function PMTeam() {
  return (
    <Card>
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-text-light">
        <Users size={48} className="text-[#E9EDDF]" />
        <p className="text-sm font-bold uppercase tracking-widest">Team — Coming Soon</p>
      </div>
    </Card>
  )
}


