const prisma = require("../services/prisma");

const getMyShifts = async (req, res) => {
    const userId = req.user.userId;

    try {
        const shifts = await prisma.shift.findMany({
            where: { userId: userId },
            orderBy: { date: "asc" },
        });

        res.json(shifts);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = { getMyShifts };
