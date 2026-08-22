import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { canManageNetworks } from '@/lib/permissions';
import {
  getAllNetworks,
  addNetwork,
  updateNetwork,
  deleteNetwork,
} from '@/lib/data/attendance';

// GET — List all approved networks (admin only)
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    if (!canManageNetworks(user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const networks = getAllNetworks();
    return NextResponse.json({ success: true, data: networks });
  } catch (error) {
    console.error('Networks GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST — Add a new approved network
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    if (!canManageNetworks(user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const {
      companyId = 'company-001',
      officeId,
      officeName,
      networkName,
      ipv4,
      cidr,
      ipv6 = '',
      enabled = true,
      validFrom,
      validUntil,
    } = body;

    if (!networkName || !cidr) {
      return NextResponse.json(
        { error: 'Network name and CIDR are required' },
        { status: 400 }
      );
    }

    const network = addNetwork({
      companyId,
      officeId: officeId ?? 'office-001',
      officeName: officeName ?? 'Default Office',
      networkName,
      ipv4: ipv4 ?? '',
      cidr,
      ipv6,
      enabled,
      validFrom: validFrom ?? new Date().toISOString().split('T')[0],
      validUntil: validUntil ?? '2030-12-31',
    });

    return NextResponse.json({ success: true, data: network }, { status: 201 });
  } catch (error) {
    console.error('Networks POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT — Update an existing network
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    if (!canManageNetworks(user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: 'Network ID is required' }, { status: 400 });
    }

    const network = updateNetwork(id, data);
    if (!network) {
      return NextResponse.json({ error: 'Network not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: network });
  } catch (error) {
    console.error('Networks PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE — Remove a network
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    if (!canManageNetworks(user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Network ID is required' }, { status: 400 });
    }

    const deleted = deleteNetwork(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Network not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Networks DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
