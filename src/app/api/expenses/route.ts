import { NextRequest, NextResponse } from 'next/server';
import { ExpenseFormData, Expense } from '@/types';

export async function GET() {
  try {
    // Return empty array - client will handle localStorage
    return NextResponse.json([]);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch expenses' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: ExpenseFormData = await request.json();
    
    // Validate required fields
    if (!body.title || !body.amount || !body.category || !body.date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create expense object
    const now = new Date().toISOString();
    const expense: Expense = {
      ...body,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: now,
      updatedAt: now,
    };

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create expense' },
      { status: 500 }
    );
  }
}
