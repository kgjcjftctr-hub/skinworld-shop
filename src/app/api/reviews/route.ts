import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );
}

export async function GET() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('reviews')
    .select('id, rating, comment, created_at')
    .order('created_at', { ascending: false })
    .limit(60);

  if (error) {
    console.error('Failed to fetch reviews:', error);
    return NextResponse.json({ error: 'Error al cargar las reseñas' }, { status: 500 });
  }

  const reviews = (data ?? []).map((r) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.created_at,
  }));
  const count = reviews.length;
  const average = count > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / count : 0;

  return NextResponse.json({ reviews, average, count });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { rating, comment, website } = body ?? {};

    // Honeypot: bots fill hidden fields humans never see.
    if (typeof website === 'string' && website.length > 0) {
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    const ratingNum = Number(rating);
    if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return NextResponse.json({ error: 'Selecciona una calificación de 1 a 5' }, { status: 400 });
    }

    const trimmedComment = typeof comment === 'string' ? comment.trim() : '';
    if (trimmedComment.length < 10 || trimmedComment.length > 600) {
      return NextResponse.json(
        { error: 'La reseña debe tener entre 10 y 600 caracteres' },
        { status: 400 }
      );
    }

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('reviews')
      .insert({ rating: ratingNum, comment: trimmedComment })
      .select('id, rating, comment, created_at')
      .single();

    if (error) {
      console.error('Failed to insert review:', error);
      return NextResponse.json({ error: 'Error al guardar la reseña' }, { status: 500 });
    }

    return NextResponse.json(
      {
        review: {
          id: data.id,
          rating: data.rating,
          comment: data.comment,
          createdAt: data.created_at,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Review submit error:', error);
    return NextResponse.json({ error: 'Error al guardar la reseña' }, { status: 500 });
  }
}
