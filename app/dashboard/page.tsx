
import { createClient } from '@/lib/server'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getClaims()
    
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p >Bienvenido a tu panel <span className="capitalize">{data?.claims.user_metadata?.full_name}</span></p>
    </div>
  );
}
