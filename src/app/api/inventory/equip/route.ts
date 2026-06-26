import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { inventory_id, equip } = await request.json()

    const { data: profile } = await supabase
      .from('student_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!profile) return NextResponse.json({ error: 'Profil tidak ditemukan' }, { status: 404 })

    // Pastikan inventory ini milik user
    const { data: inv } = await supabase
      .from('student_inventory')
      .select('id, student_id, items(type, stats)')
      .eq('id', inventory_id)
      .eq('student_id', profile.id)
      .single()

    if (!inv) return NextResponse.json({ error: 'Item tidak ditemukan' }, { status: 404 })

    // Update equip status
    const { error } = await supabase
      .from('student_inventory')
      .update({ is_equipped: equip })
      .eq('id', inventory_id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Update stat karakter berdasarkan semua gear yang equipped
    const { data: equippedGear } = await supabase
      .from('student_inventory')
      .select('items(stats)')
      .eq('student_id', profile.id)
      .eq('is_equipped', true)

    const totalArmor = equippedGear?.reduce((s: number, g: any) => s + (g.items?.stats?.armor ?? 0), 0) ?? 0
    const totalIntellect = equippedGear?.reduce((s: number, g: any) => s + (g.items?.stats?.intellect ?? 0), 0) ?? 0

    await supabase
      .from('student_profiles')
      .update({ armor_stat: totalArmor, intellect_stat: totalIntellect, updated_at: new Date().toISOString() })
      .eq('id', profile.id)

    return NextResponse.json({ success: true, equip })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
