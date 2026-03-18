import prisma from './prismaClient';
import bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { supabase } from '../config/supabaseClient';

// 1. Initialize Dotenv
dotenv.config();

async function createSupabaseUser(email: string, password: string, userData: any) {
  try {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name: userData.name,
        role: userData.role,
        department: userData.department,
        avatar_url: userData.avatarUrl,
        worker_id: userData.workerId,
        phone: userData.phone,
      },
    });

    if (error) {
      if (error.message.includes('already exists')) {
        // If it exists, update the user metadata instead
        const existing = await supabase.auth.admin.listUsers();
        const found = existing.data.users.find(u => u.email === email);
        if (found) {
          await supabase.auth.admin.updateUserById(found.id, {
            user_metadata: {
              name: userData.name,
              role: userData.role,
              department: userData.department,
              avatar_url: userData.avatarUrl,
              worker_id: userData.workerId,
              phone: userData.phone,
            },
            password // Update password to ensure it's not "invalid" for Supabase login
          });
          console.log(`ℹ️ Supabase user ${email} already existed and was updated.`);
        }
        return;
      }
      throw error;
    }
    console.log(`✅ Supabase user created: ${data.user?.email}`);
  } catch (err: any) {
    console.error(`❌ Failed to create Supabase user ${email}:`, err.message);
  }
}

async function main() {
  console.log('🚀 Ignition: Starting seed script...');

  try {
    // Check if Tenant exists
    console.log('Checking for Hilton Hotel...');
    const hotel = await prisma.tenant.upsert({
      where: { companyName: 'Hilton' },
      update: {},
      create: { companyName: 'Hilton' },
    });
    console.log(`🏨 Hotel Ready: ${hotel.companyName}`);

    const commonPassword = await bcrypt.hash('Password123!', 10);
    const plainPassword = 'Password123!';

    // Helper to generic seed user
    async function seedUser(
      idx: string,
      role: 'MANAGER' | 'EMPLOYEE',
      department: 'INDIAN' | 'CHINESE'
    ) {
      const email = `${role.toLowerCase()}${idx}_${department.toLowerCase()}@hilton.com`;
      const name = `${role === 'MANAGER' ? 'Manager' : 'Employee'} ${idx} (${department})`;
      const phone = `+9477${role === 'MANAGER' ? '1' : '2'}${department === 'INDIAN' ? '1' : '2'}000${idx}`;
      const workerId = `${role.charAt(0)}-${department.charAt(0)}-00${idx}`;

      console.log(`Seeding ${name}...`);
      await createSupabaseUser(email, plainPassword, {
        name,
        role,
        department,
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        workerId,
        phone
      });

      await prisma.user.upsert({
        where: { email },
        update: {
          name,
          role,
          department,
          workerId,
          phone,
          password: commonPassword,
          avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
          plan: 'Premium',
          availabilityPreferences: 'Monday to Friday, 9AM to 5PM',
          fcmToken: `fake_fcm_token_${workerId}`,
        },
        create: {
          email,
          name,
          password: commonPassword,
          role,
          workerId,
          phone,
          tenantId: hotel.id,
          department,
          avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
          plan: 'Premium',
          availabilityPreferences: 'Monday to Friday, 9AM to 5PM',
          fcmToken: `fake_fcm_token_${workerId}`,
        },
      });
    }

    // Seed INDIAN Department
    console.log('--- Seeding INDIAN Department ---');
    await seedUser('1', 'MANAGER', 'INDIAN');
    for (let i = 1; i <= 5; i++) {
      await seedUser(i.toString(), 'EMPLOYEE', 'INDIAN');
    }

    // Seed CHINESE Department
    console.log('--- Seeding CHINESE Department ---');
    await seedUser('1', 'MANAGER', 'CHINESE');
    for (let i = 1; i <= 5; i++) {
      await seedUser(i.toString(), 'EMPLOYEE', 'CHINESE');
    }

    // --- Seed Leave Types ---
    console.log('--- Seeding Leave Types ---');
    const leaveTypesData = [
      { name: 'Annual Leave', totalDays: 14 },
      { name: 'Sick Leave', totalDays: 7 },
      { name: 'Casual Leave', totalDays: 5 },
      { name: 'Maternity Leave', totalDays: 90 },
    ];
    
    const seededLeaveTypes = [];
    for (const lt of leaveTypesData) {
      let existing = await prisma.leaveType.findFirst({ where: { name: lt.name } });
      if (!existing) {
        existing = await prisma.leaveType.create({ data: lt });
      } else {
        existing = await prisma.leaveType.update({
          where: { id: existing.id },
          data: { totalDays: lt.totalDays }
        });
      }
      seededLeaveTypes.push(existing);
    }

    // --- Seed Sample Leave Requests ---
    console.log('--- Seeding Sample Leave Requests ---');
    const employee1 = await prisma.user.findUnique({ where: { email: 'employee1_indian@hilton.com' } });
    
    if (employee1 && seededLeaveTypes.length > 0) {
      const existingReqCount = await prisma.leaveRequest.count({ where: { employeeId: employee1.id } });
      
      if (existingReqCount === 0) {
        const now = new Date();
        const nextWeekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7);
        const nextWeekEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 9);
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 15);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth() - 1, 16);

        await prisma.leaveRequest.create({
          data: {
            employeeId: employee1.id,
            leaveTypeId: seededLeaveTypes[0].id, 
            startDate: lastMonthStart,
            endDate: lastMonthEnd,
            dayType: 'full',
            reason: 'Personal vacation',
            status: 'approved'
          }
        });

        await prisma.leaveRequest.create({
          data: {
            employeeId: employee1.id,
            leaveTypeId: seededLeaveTypes[1].id, 
            startDate: nextWeekStart,
            endDate: nextWeekEnd,
            dayType: 'full',
            reason: 'Medical appointment',
            status: 'pending'
          }
        });
        console.log(`✅ Seeded 2 sample leave requests for ${employee1.name}`);
      } else {
        console.log(`ℹ️ Leave requests already exist for ${employee1.name}, skipping sample request seeding.`);
      }
    }

    console.log('✅ SEEDING COMPLETE: Database is ready.');
  } catch (error) {
    console.error('❌ FATAL SEED ERROR:', error);
    process.exit(1);
  }
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