import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

const RARITY_PRICE: Record<string, number> = {
  common: 100, rare: 300, epic: 600, legendary: 1200, mythic: 2500,
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { item_id, price } = await request.json()
    if (!item_id) return NextResponse.json({ error: 'Item tidak valid' }, { status: 400 })

    // Ambil profile dan item secara parallel
    const [{ data: profile }, { data: item }] = await Promise.all([
      supabase.from('student_profiles').select('id, xp').eq('user_id', user.id).single(),
      supabase.from('items').select('id, rarity, is_active').eq('id', item_id).single(),
    ])

    if (!profile) return NextResponse.json({ error: 'Profil tidak ditemukan' }, { status: 404 })
    if (!item || !item.is_active) return NextResponse.json({ error: 'Item tidak tersedia' }, { status: 404 })

    const actualPrice = RARITY_PRICE[item.rarity] ?? 100
    if (profile.xp < actualPrice) return NextResponse.json({ error: 'XP tidak cukup' }, { status: 400 })

    // Cek apakah sudah punya item ini
    const { data: existing } = await supabase
      .from('student_inventory')
      .select('id, quantity')
      .eq('student_id', profile.id)
      .eq('item_id', item_id)
      .maybeSingle()

    // Transaksi: kurangi XP + tambah inventory
    const [xpResult, invResult] = await Promise.all([
      supabase
        .from('student_profiles')
        .update({ xp: profile.xp - actualPrice, updated_at: new Date().toISOString() })
        .eq('id', profile.id),
      existing
        ? supabase.from('student_inventory').update({ quantity: existing.quantity + 1 }).eq('id', existing.id)
        : supabase.from('student_inventory').insert({ student_id: profile.id, item_id, quantity: 1, is_equipped: false }),
    ])

    if (xpResult.error) return NextResponse.json({ error: xpResult.error.message }, { status: 500 })
    if (invResult.error) return NextResponse.json({ error: invResult.error.message }, { status: 500 })

    // Catat ke xp_logs
    await supabase.from('xp_logs').insert({
      student_id: profile.id,
      amount: -actualPrice,
      source: 'shop',
      description: `Beli item dari toko`,
    })

    return NextResponse.json({ success: true, xp_remaining: profile.xp - actualPrice })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
