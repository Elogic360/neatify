import { useEffect, useState } from 'react'
import { adminApi, type Customer } from '../../app/api'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import { Moon, Sun } from 'lucide-react'

export default function CustomersAdminPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [theme, setTheme] = useState<'light' | 'dark'>('dark') // Default to dark

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  }

  const isDark = theme === 'dark'

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true)
        const response = await adminApi.getAll()
        const data = response.data?.items || response.data || []
        setCustomers(data)
        setError(null)
      } catch (e: any) {
        setError(e.message || 'Failed to load customers')
      } finally {
        setLoading(false)
      }
    }

    fetchCustomers()
  }, [])

  return (
    <div className={`space-y-4 ${isDark ? 'bg-black text-gray-900 dark:text-white' : 'bg-white text-gray-900'}`}>
      {/* Theme Toggle */}
      <div className="flex justify-end mb-4">
        <button
          onClick={toggleTheme}
          className={`rounded-lg p-2 transition-colors ${
            isDark
              ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-xl font-semibold ${
            isDark ? 'text-gray-900 dark:text-white' : 'text-gray-900'
          }`}>Customers</h2>
          <p className={`text-sm ${
            isDark ? 'text-gray-500 dark:text-slate-400' : 'text-gray-600'
          }`}>View your customer base</p>
        </div>
        <Badge variant="default">{customers.length} total</Badge>
      </div>

      {error && (
        <div className={`rounded-xl border p-4 text-sm ${
          isDark
            ? 'border-rose-500/30 bg-rose-500/10 text-rose-200'
            : 'border-rose-300 bg-rose-50 text-rose-800'
        }`}>
          {error}
        </div>
      )}

      {loading ? (
        <div className={`text-sm ${
          isDark ? 'text-gray-500 dark:text-slate-400' : 'text-gray-600'
        }`}>Loading customers…</div>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`border-b text-left ${
                  isDark
                    ? 'border-white/10 text-gray-500 dark:text-slate-400'
                    : 'border-gray-200 text-gray-500'
                }`}>
                  <th className="pb-3 pr-4">ID</th>
                  <th className="pb-3 pr-4">Name</th>
                  <th className="pb-3 pr-4">Email</th>
                  <th className="pb-3">Phone</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id} className={`border-b ${
                    isDark ? 'border-white/5' : 'border-gray-100'
                  }`}>
                    <td className={`py-3 pr-4 font-mono ${
                      isDark ? 'text-gray-500 dark:text-slate-400' : 'text-gray-500'
                    }`}>#{customer.id}</td>
                    <td className={`py-3 pr-4 font-medium ${
                      isDark ? 'text-gray-900 dark:text-white' : 'text-gray-900'
                    }`}>{customer.name}</td>
                    <td className="py-3 pr-4">
                      <a
                        href={`mailto:${customer.email}`}
                        className={`${
                          isDark
                            ? 'text-indigo-400 hover:text-indigo-300'
                            : 'text-indigo-600 hover:text-indigo-700'
                        } hover:underline`}
                      >
                        {customer.email}
                      </a>
                    </td>
                    <td className={`py-3 ${
                      isDark ? 'text-gray-500 dark:text-slate-400' : 'text-gray-500'
                    }`}>
                      {customer.phone || '—'}
                    </td>
                  </tr>
                ))}
                {customers.length === 0 && (
                  <tr>
                    <td colSpan={4} className={`py-8 text-center ${
                      isDark ? 'text-gray-500 dark:text-slate-400' : 'text-gray-500'
                    }`}>
                      No customers yet. They'll appear here after their first order.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
