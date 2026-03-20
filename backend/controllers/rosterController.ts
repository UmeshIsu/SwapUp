import { Request, Response } from 'express';
import { prisma } from '../config/prisma';

export const getRoster = async (req: Request, res: Response) => {
  try {
    const { start, end } = req.query;

    if (!start || !end) {
      return res.status(400).json({ error: "Start and end dates are required" });
    }

    const { tenantId, role, department } = req.user as any;

    const whereClause: any = {
      startTime: {
        gte: new Date(start as string),
        lte: new Date(end as string),
      },
    };

    // Add tenant filtering
    if (tenantId) {
      whereClause.employee = {
        tenantId: tenantId
      };
    }

    // Add department filtering for managers
    if (role === 'MANAGER' && department) {
      whereClause.employee = {
        ...whereClause.employee,
        department: department
      };
    }

    const shifts = await prisma.shift.findMany({
      where: whereClause,
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            department: true,
          }
        }
      },
      orderBy: { startTime: 'asc' },
    });

    res.json(shifts);
  } catch (error) {
    res.status(500).json({ error: "Error fetching roster" });
  }
};