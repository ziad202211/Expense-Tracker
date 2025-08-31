import { NextRequest, NextResponse } from 'next/server';
import { getUserProfile, updateUserProfile } from '@/lib/data';

export async function GET() {
  try {
    const profile = await getUserProfile();
    return NextResponse.json(profile);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Convert salary to number if provided and validate
    if (body.salary !== undefined) {
      const salaryNumber = Number(body.salary);
      if (isNaN(salaryNumber) || salaryNumber < 0) {
        return NextResponse.json(
          { error: 'Invalid salary value' },
          { status: 400 }
        );
      }
      body.salary = salaryNumber;
    }

    const profile = await updateUserProfile(body);
    return NextResponse.json(profile);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update user profile' },
      { status: 500 }
    );
  }
}
