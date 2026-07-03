import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import crypto from 'crypto';

// ---------------------------------------------------------------------------
// Attendance is QR-only. Each restaurant (tenant) has its own SiteQrCode whose
// `qrToken` is printed on a QR at the entrance. Staff scan it in the app to
// mark attendance — a token from another restaurant is rejected.
// (Geolocation check-in has been removed.)
// ---------------------------------------------------------------------------

/** A fresh opaque token to encode in a restaurant's attendance QR. */
function makeQrToken(): string {
    return `SWAPUP-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;
}

/** Find the tenant's SiteQrCode, creating one on first use. */
async function ensureSiteQr(tenantId: string) {
    let site = await (prisma as any).siteQrCode.findUnique({ where: { tenantId } });
    if (!site) {
        site = await (prisma as any).siteQrCode.create({
            data: { tenantId, qrToken: makeQrToken() },
        });
    }
    return site;
}

// ---------------------------------------------------------------------------
// POST /api/attendance/qr-check-in
// Body: { code: string } — the value decoded from the restaurant's QR code.
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

        // ── Validate the scanned token against THIS restaurant's QR ──────────
        const site = await (prisma as any).siteQrCode.findUnique({ where: { tenantId } });
        if (!site) {
            res.json({
                status: 'REJECTED',
                reason: 'Attendance QR is not set up for your restaurant yet. Please contact your admin.',
            });
            return;
        }
        if (code.trim() !== site.qrToken) {
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
            res.json({ status: 'REJECTED', reason: 'You have already checked in today.' });
            return;
        }

        // ── Approved ────────────────────────────────────────────────────────
        // lat/lng/accuracy are legacy geo columns (kept for schema compat) — 0.
        const attendance = await prisma.attendance.create({
            data: { userId, lat: 0, lng: 0, accuracy: 0, status: 'APPROVED' },
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

// ---------------------------------------------------------------------------
// GET /api/attendance/site-qr  (MANAGER / ADMIN)
// Returns the value to encode in this restaurant's printable attendance QR.
// ---------------------------------------------------------------------------
export const getSiteQr = async (req: Request, res: Response): Promise<void> => {
    try {
        const tenantId = req.user!.tenantId;
        const site = await ensureSiteQr(tenantId);
        const tenant = await prisma.tenant.findUnique({
            where: { id: tenantId },
            select: { companyName: true },
        });
        res.json({ qrToken: site.qrToken, companyName: tenant?.companyName ?? '' });
    } catch (error) {
        console.error('[attendance] getSiteQr error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// ---------------------------------------------------------------------------
// POST /api/attendance/site-qr/regenerate  (ADMIN)
// Rotates the token — the old printed QR stops working, a new one is issued.
// ---------------------------------------------------------------------------
export const regenerateSiteQr = async (req: Request, res: Response): Promise<void> => {
    try {
        const tenantId = req.user!.tenantId;
        const qrToken = makeQrToken();
        const site = await (prisma as any).siteQrCode.upsert({
            where: { tenantId },
            update: { qrToken },
            create: { tenantId, qrToken },
        });
        res.json({ qrToken: site.qrToken });
    } catch (error) {
        console.error('[attendance] regenerateSiteQr error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// ---------------------------------------------------------------------------
// POST /api/attendance/check-out
// ---------------------------------------------------------------------------
export const postCheckOut = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user!.id;

        // Find the latest APPROVED attendance that hasn't been checked out
        const openAttendance = await prisma.attendance.findFirst({
            where: { userId, status: 'APPROVED', checkedOutAt: null },
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

// ---------------------------------------------------------------------------
// GET /api/attendance/status
// ---------------------------------------------------------------------------
export const getAttendanceStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user!.id;

        const openAttendance = await prisma.attendance.findFirst({
            where: { userId, status: 'APPROVED', checkedOutAt: null },
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
