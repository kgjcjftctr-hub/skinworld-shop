import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'reviews.json');

type Review = {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
};

async function readReviews(): Promise<Review[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeReviews(reviews: Review[]) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(reviews, null, 2));
}

export async function GET() {
  const reviews = await readReviews();
  const sorted = [...reviews].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const count = sorted.length;
  const average = count > 0 ? sorted.reduce((sum, r) => sum + r.rating, 0) / count : 0;

  return NextResponse.json({ reviews: sorted.slice(0, 60), average, count });
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

    const reviews = await readReviews();
    const newReview: Review = {
      id: randomUUID(),
      rating: ratingNum,
      comment: trimmedComment,
      createdAt: new Date().toISOString(),
    };
    reviews.push(newReview);
    await writeReviews(reviews);

    return NextResponse.json({ review: newReview }, { status: 201 });
  } catch (error) {
    console.error('Review submit error:', error);
    return NextResponse.json({ error: 'Error al guardar la reseña' }, { status: 500 });
  }
}
