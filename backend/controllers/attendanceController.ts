import { Request, Response } from 'express';
import { prisma } from '../config/prisma';

// ---------------------------------------------------------------------------
// Haversine formula — returns distance in metres between two lat/lng points
// ---------------------------------------------------------------------------
function haversineMetres(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6_371_000; // Earth radius in metres
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ---------------------------------------------------------------------------
// POST /api/attendance/check-in
// Body: { lat: number, lng: number, accuracy: number }
// ---------------------------------------------------------------------------
export const postCheckIn = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user!.id;
        const { lat, lng, accuracy } = req.body as {
            lat: number;
            lng: number;
            accuracy: number;
        };

        if (lat === undefined || lng === undefined) {
            res.status(400).json({ error: 'lat and lng are required' });
            return;
        }

        // ── Site configuration (set in .env) ──────────────────────────────
        const siteLat = parseFloat(process.env.SITE_LAT ?? '0');
        const siteLng = parseFloat(process.env.SITE_LNG ?? '0');
        const radiusM = parseFloat(process.env.CHECK_IN_RADIUS_M ?? '150');

        // ── Once-per-day guard ─────────────────────────────────────────────
        const todayStart = new Date();
        todayStart.setUTCHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setUTCHours(23, 59, 59, 999);

        const existing = await prisma.attendance.findFirst({
            where: {
                userId,
                status: 'APPROVED',
                checkedInAt: { gte: todayStart, lte: todayEnd },
            },
        });

        if (existing) {
            await prisma.attendance.create({
                data: {
                    userId,
                    lat,
                    lng,
                    accuracy: accuracy ?? 999,
                    status: 'REJECTED',
                    rejectReason: 'You have already checked in today.',
                },
            });

            res.json({
                status: 'REJECTED',
                reason: 'You have already checked in today.',
            });
            return;
        }

        // ── Distance check ─────────────────────────────────────────────────
        const distanceM = Math.round(haversineMetres(lat, lng, siteLat, siteLng));

        if (distanceM > radiusM) {
            const rejectReason = `You are ${distanceM} m away from the site. Must be within ${radiusM} m.`;

            await prisma.attendance.create({
                data: {
                    userId,
                    lat,
                    lng,
                    accuracy: accuracy ?? 999,
                    status: 'REJECTED',
                    rejectReason,
                },
            });

            res.json({ status: 'REJECTED', reason: rejectReason, distanceM });
            return;
        }

        // ── Approved ───────────────────────────────────────────────────────
        const attendance = await prisma.attendance.create({
            data: {
                userId,
                lat,
                lng,
                accuracy: accuracy ?? 999,
                status: 'APPROVED',
            },
        });

        res.json({
            status: 'APPROVED',
            checkedInAt: attendance.checkedInAt.toISOString(),
            distanceM,
        });
    } catch (error) {
        console.error('[attendance] postCheckIn error:', error);
        res.status(500).json({ error: 'Internal server error during check-in' });
    }
};


// ---------------------------------------------------------------------------
// POST /api/attendance/qr-check-in
// Body: { code: string }  — the value decoded from the restaurant's QR code.
// Geo-fence logic above is intentionally kept but no longer used for check-in.
// The QR value must match the user's tenant (company id or name).
// ---------------------------------------------------------------------------
export const postQrCheckIn = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user!.id;
        const tenantId = req.user!.tenantId;
        const { code } = req.body as { code?: string };

        if (!code || !code.trim()) {
            res.status(400).json({ error: 'A QR code value is required' });
            return;
        }

        // ── Validate the scanned code against the user's restaurant (tenant) ──
        const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });

        // Accept any of: the configured site code, the tenant id, or the company name.
        const scanned = code.trim().toLowerCase();
        const siteCode = (process.env.SITE_QR_CODE ?? '').trim().toLowerCase();
        const allowed = [
            siteCode,
            tenantId.toLowerCase(),
            tenant?.companyName?.trim().toLowerCase() ?? '',
            // Support a namespaced payload like "SWAPUP:<tenantId>"
            `swapup:${tenantId.toLowerCase()}`,
            tenant ? `swapup:${tenant.companyName.trim().toLowerCase()}` : '',
        ].filter(Boolean);

        if (!allowed.includes(scanned)) {
            res.json({
                status: 'REJECTED',
                reason: 'This QR code does not belong to your restaurant.',
            });
            return;
        }

        // ── Once-per-day guard ─────────────────────────────────────────────
        const todayStart = new Date();
        todayStart.setUTCHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setUTCHours(23, 59, 59, 999);

        const existing = await prisma.attendance.findFirst({
            where: {
                userId,
                status: 'APPROVED',
                checkedInAt: { gte: todayStart, lte: todayEnd },
            },
        });

        if (existing) {
            res.json({
                status: 'REJECTED',
                reason: 'You have already checked in today.',
            });
            return;
        }

        // ── Approved ───────────────────────────────────────────────────────
        // lat/lng/accuracy columns are non-nullable; QR check-ins store 0 sentinels.
        const attendance = await prisma.attendance.create({
            data: {
                userId,
                lat: 0,
                lng: 0,
                accuracy: 0,
                status: 'APPROVED',
            },
        });

        res.json({
            status: 'APPROVED',
            checkedInAt: attendance.checkedInAt.toISOString(),
        });
    } catch (error) {
        console.error('[attendance] postQrCheckIn error:', error);
        res.status(500).json({ error: 'Internal server error during QR check-in' });
    }
};


// POST /api/attendance/check-out

export const postCheckOut = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user!.id;

        // Find the latest APPROVED attendance that hasn't been checked out
        const openAttendance = await prisma.attendance.findFirst({
            where: {
                userId,
                status: 'APPROVED',
                checkedOutAt: null,
            },
            orderBy: { checkedInAt: 'desc' },
        });

        if (!openAttendance) {
            res.status(400).json({ error: 'No open check-in found to check out from.' });
            return;
        }

        const updated = await prisma.attendance.update({
            where: { id: openAttendance.id },
            data: { checkedOutAt: new Date() },
        });

        res.json({
            status: 'CHECKED_OUT',
            checkedInAt: updated.checkedInAt.toISOString(),
            checkedOutAt: updated.checkedOutAt!.toISOString(),
        });
    } catch (error) {
        console.error('[attendance] postCheckOut error:', error);
        res.status(500).json({ error: 'Internal server error during check-out' });
    }
};

// GET /api/attendance/status
export const getAttendanceStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user!.id;
        
        const openAttendance = await prisma.attendance.findFirst({
            where: {
                userId,
                status: 'APPROVED',
                checkedOutAt: null,
            },
            orderBy: { checkedInAt: 'desc' },
        });

        if (openAttendance) {
            res.json({ status: 'open', attendance: openAttendance });
            return;
        }

        const todayStart = new Date();
        todayStart.setUTCHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setUTCHours(23, 59, 59, 999);

        const completedAttendance = await prisma.attendance.findFirst({
            where: {
                userId,
                status: 'APPROVED',
                checkedOutAt: { not: null },
                checkedInAt: { gte: todayStart, lte: todayEnd },
            },
        });

        if (completedAttendance) {
            res.json({ status: 'completed', attendance: completedAttendance });
            return;
        }

        res.json({ status: 'none', attendance: null });
    } catch (error) {
        console.error('[attendance] getAttendanceStatus error:', error);
        res.status(500).json({ error: 'Internal server error during status check' });
    }
};

