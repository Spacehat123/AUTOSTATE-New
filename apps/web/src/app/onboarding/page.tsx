'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CsvStep } from '@/components/onboarding/csv-step'

function IntegrationStep({ onNext, onBack }: { onNext: () => void, onBack: () => void }) {
  return (
    <div className="space-y-6 text-center">
      <h2 className="text-xl font-semibold">Integrations</h2>
      <p className="text-zinc-400">Placeholder for integration setup.</p>
      <div className="flex gap-4">
        <button type="button" onClick={onBack} className="flex-1 bg-zinc-800 text-white rounded-lg px-4 py-3 hover:bg-zinc-700">Back</button>
        <button type="button" onClick={onNext} className="flex-1 bg-white text-black font-semibold rounded-lg px-4 py-3 hover:bg-zinc-200">Next</button>
      </div>
    </div>
  )
}



export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    companyName: '',
    gstNumber: '',
    phone: '',
  })

  const handleSubmit = async () => {
    setIsLoading(true)
    setError('')

    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(errorText || 'Something went wrong')
      }

      router.push('/dashboard')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault()
    setStep(2)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4 text-white">
      <div className="w-full max-w-md bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 p-8 rounded-2xl shadow-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Welcome to Autostate</h1>
          <p className="text-zinc-400 text-sm">
            {step === 1 && "Let's get your company set up before we start."}
            {step === 2 && "Connect your integrations."}
            {step === 3 && "Upload your existing data."}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-lg text-center mb-6">
            {error}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleStep1Submit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="companyName" className="text-sm font-medium text-zinc-300">Company Name *</label>
              <input
                id="companyName"
                type="text"
                required
                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="Acme Corp"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="gstNumber" className="text-sm font-medium text-zinc-300">GST Number (Optional)</label>
              <input
                id="gstNumber"
                type="text"
                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="22AAAAA0000A1Z5"
                value={formData.gstNumber}
                onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium text-zinc-300">Phone Number (Optional)</label>
              <input
                id="phone"
                type="tel"
                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="+1 234 567 8900"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-white text-black font-semibold rounded-lg px-4 py-3 hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-zinc-900 transition-all mt-4"
            >
              Next
            </button>
          </form>
        )}

        {step === 2 && (
          <IntegrationStep onNext={() => setStep(3)} onBack={() => setStep(1)} />
        )}

        {step === 3 && (
          <div className="space-y-4">
            <CsvStep onComplete={handleSubmit} onSkip={handleSubmit} />
            <div className="flex justify-center mt-4">
               <button type="button" onClick={() => setStep(2)} className="text-sm text-zinc-500 hover:text-zinc-300">Go Back</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
