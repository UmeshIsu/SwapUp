// -----------------------------------------------------------------------
// setSiteQr.ts — assign a restaurant its attendance QR token.
//
// Usage (from backend/):
//   npx ts-node prisma/setSiteQr.ts                → Hilton, fixed demo token
//   npx ts-node prisma/setSiteQr.ts "Cinnamon"     → named tenant, random token
//
// The printed QR at the entrance must encode exactly this token. Staff scan it
// in the SwapUp app to mark attendance.
// -----------------------------------------------------------------------

import prisma from '../services/prisma';
import crypto from 'crypto';

async function main() {
    const companyName = process.argv[2] || 'Hilton';

    // For the Hilton demo we use a fixed, known token so the sample printable QR
    // matches. Any other tenant gets a fresh random token.
    const token =
        companyName === 'Hilton'
            ? 'SWAPUP-HILTON-3F7A9C2E'
            : `SWAPUP-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;

    const tenant = await (prisma as any).tenant.findUnique({ where: { companyName } });
    if (!tenant) {
        console.error(`❌ Tenant "${companyName}" not found.`);
        process.exit(1);
    }

    const site = await (prisma as any).siteQrCode.upsert({
        where: { tenantId: tenant.id },
        update: { qrToken: token },
        create: { tenantId: tenant.id, qrToken: token },
    });

    console.log(`✅ ${companyName} attendance QR token set to:\n\n   ${site.qrToken}\n`);
    console.log('Encode exactly that string in the printable QR at the entrance.');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
