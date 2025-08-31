import { NextResponse } from 'next/server';
import { getExpenses } from '@/lib/data';
import { calculateExpenseStats } from '@/lib/utils';

export async function GET() {
  try {
    const expenses = await getExpenses();
    const stats = calculateExpenseStats(expenses);
    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch expense statistics' },
      { status: 500 }
    );
  }
}
