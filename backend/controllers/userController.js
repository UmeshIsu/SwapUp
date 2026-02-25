const bcrypt = require("bcrypt");
const prisma = require("../services/prisma");

const updateProfile = async (req, res) => {
    const { name, phone, availabilityPreferences } = req.body;
    const userId = req.user.userId;

    try {
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                name,
                phone,
                availabilityPreferences,
            },
        });

        res.json({ message: "Profile updated successfully", user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const changePassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.userId;

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        const isMatch = await bcrypt.compare(oldPassword, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: "Incorrect old password" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });

        res.json({ message: "Password changed successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = { updateProfile, changePassword };
