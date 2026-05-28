import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import axios from 'axios'
import { Eye, EyeOff, Shield, ArrowRight } from 'lucide-react'

import { useAuthStore } from '@/store'
import { authApi } from '../api/authApi'
import { PATHS } from '@/router/path'
import { Button } from '@/shared/components/ui/Button'
import { cn } from '@/shared/lib/cn'
import { normalizeRole } from '@/shared/config/role'

// Assets
import brandLogo from '@/shared/assets/studio_logo.png'
import emailIcon from '@/shared/assets/email.png'
import passwordIcon from '@/shared/assets/password.png'

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type FormData = z.infer<typeof schema>

const roleToPath: Record<string, string> = {
  admin: PATHS.ADMIN_DASHBOARD,
  project_manager: PATHS.PM_DASHBOARD,
  hr: PATHS.HR_DASHBOARD,
  employee: PATHS.EMPLOYEE_DASHBOARD,
  site_person: PATHS.SITE_DASHBOARD,
}

const rolePriority = ['admin', 'project_manager', 'hr', 'site_person', 'employee']

function pickMainRole(roles: string[] | undefined): string {
  const normalized = (roles ?? []).map(normalizeRole)
  for (const r of rolePriority) if (normalized.includes(r)) return r
  return normalized[0] || 'employee'
}

function getErrorMessage(err: unknown) {
  if (axios.isAxiosError(err)) {
    const data: any = err.response?.data
    return data?.message || err.message || 'Login failed. Please try again.'
  }
  return err instanceof Error ? err.message : 'Login failed. Please try again.'
}

const SALogo = () => (
  <div className="flex flex-col items-center justify-center mb-8">
    <div className="relative w-32 h-16 flex items-center justify-center">
      <img src={brandLogo} alt="Studio Architects Logo" className="w-full h-full object-contain" />
    </div>
  </div>
)

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (data: FormData) => {
    setError('')
    try {
      const res = await authApi.login(data)
      login({ ...res })

      const mainRole = pickMainRole(res.roles)
      const targetPath = roleToPath[mainRole] || PATHS.ADMIN_DASHBOARD
      navigate(targetPath, { replace: true })
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  return (
    <div className="relative h-screen w-full flex items-center justify-center overflow-hidden font-sans bg-[#F5F7F2]">
      {/* ── Background Image: Architectural Villa/Blueprint Focus ── */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat scale-105"
        style={{ 
          backgroundImage: 'url("https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=2400")',
          filter: 'blur(12px) brightness(0.65)'
        }}
      />
      
      {/* ── Ambient Overlay ── */}
      <div className="absolute inset-0 z-10 bg-gradient-to-tr from-[#1A1F14]/70 via-transparent to-[#40521B]/40" />

      {/* ── Center Container ── */}
      <div className="relative z-20 w-full max-w-[480px] px-6 flex flex-col items-center animate-fade-in">
        
        {/* Login Card */}
        <div className="w-full bg-white/95 backdrop-blur-2xl rounded-2xl md:rounded-[28px] shadow-[0_32px_80px_rgba(0,0,0,0.25)] border border-white/30 overflow-hidden p-6 md:p-10 flex flex-col items-center">
          
          <SALogo />

          <div className="text-center mb-6 md:mb-8">
            <h1 className="text-2xl font-black text-[#1A1F14] tracking-tight">Studio Architects</h1>
            <p className="text-[#40521B]/60 text-[13px] mt-1 font-bold uppercase tracking-widest">Enterprise Access</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-5">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-[#40521B] uppercase tracking-wider ml-1">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center pointer-events-none transition-transform duration-300 group-focus-within:scale-110">
                  <img src={emailIcon} alt="Email" className="w-full h-full object-contain" />
                </div>
                <input
                  {...register('email')}
                  type="email"
                  autoComplete="email"
                  placeholder="name@studioarchitects.com"
                  className={cn(
                    "w-full pl-14 pr-4 py-4 rounded-xl border border-transparent bg-[#F5F7F2] text-sm font-semibold transition-all duration-300 outline-none shadow-inner",
                    errors.email ? "border-red-200 bg-red-50/50" : "focus:bg-white focus:border-[#40521B]/30 focus:ring-4 focus:ring-[#40521B]/5"
                  )}
                />
              </div>
              {errors.email && <p className="text-[11px] font-medium text-red-500 mt-1 ml-1">{errors.email.message}</p>}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between ml-1">
                <label className="text-[12px] font-bold text-[#40521B] uppercase tracking-wider">
                  Password
                </label>
                <button type="button" className="text-[11px] font-extrabold text-[#40521B] hover:text-[#556F1F] transition-colors">
                  Forgot?
                </button>
              </div>
              <div className="relative group">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center pointer-events-none transition-transform duration-300 group-focus-within:scale-110">
                  <img src={passwordIcon} alt="Password" className="w-full h-full object-contain" />
                </div>
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={cn(
                    "w-full pl-14 pr-12 py-4 rounded-xl border border-transparent bg-[#F5F7F2] text-sm font-semibold transition-all duration-300 outline-none shadow-inner",
                    errors.password ? "border-red-200 bg-red-50/50" : "focus:bg-white focus:border-[#40521B]/30 focus:ring-4 focus:ring-[#40521B]/5"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1A1F14]/30 hover:text-[#40521B] transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-[11px] font-medium text-red-500 mt-1 ml-1">{errors.password.message}</p>}
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 animate-shake">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                <p className="text-xs font-bold text-red-600">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              fullWidth
              loading={isSubmitting}
              className="h-14 mt-2 rounded-xl bg-gradient-to-r from-[#334612] to-[#556F1F] hover:from-[#40521B] hover:to-[#718742] text-white font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-[#40521B]/20 active:scale-[0.97] transition-all duration-300 flex items-center justify-center gap-2 group"
            >
              {isSubmitting ? 'Verifying...' : (
                <>
                  Enter Studio
                  <ArrowRight size={18} className="group-hover:translate-x-1.5 transition-transform" />
                </>
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-[#1A1F14]/5 w-full flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-1.5 bg-[#F5F7F2] rounded-full border border-[#1A1F14]/5">
              <Shield size={13} className="text-[#40521B]" />
              <span className="text-[9px] font-black text-[#1A1F14]/50 uppercase tracking-widest">Encrypted Session</span>
            </div>
            <p className="text-[9px] font-bold text-[#1A1F14]/30 uppercase tracking-[0.3em]">
              © 2026 Studio Architects
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}


