import prisma from './prismaClient';

async function main() {
  console.log("--- Starting Leave Types Migration ---");

  // 1. Fetch all leave types to get their IDs
  const leaveTypes = await prisma.leaveType.findMany();
  
  const annualLeave = leaveTypes.find(lt => lt.name === 'Annual Leave');
  const sickLeave = leaveTypes.find(lt => lt.name === 'Sick Leave');
  const casualLeave = leaveTypes.find(lt => lt.name === 'Casual Leave');

  const annual = leaveTypes.find(lt => lt.name === 'Annual');
  const sick = leaveTypes.find(lt => lt.name === 'Sick');
  const casual = leaveTypes.find(lt => lt.name === 'Casual');

  if (!annual || !sick || !casual) {
    console.error("Error: Could not find target leave types 'Annual', 'Sick', or 'Casual'.");
    return;
  }

  // 2. Re-link leave requests
  if (annualLeave) {
    const res = await prisma.leaveRequest.updateMany({
      where: { leaveTypeId: annualLeave.id },
      data: { leaveTypeId: annual.id }
    });
    console.log(`Re-linked ${res.count} requests from 'Annual Leave' to 'Annual'`);
  }

  if (sickLeave) {
    const res = await prisma.leaveRequest.updateMany({
      where: { leaveTypeId: sickLeave.id },
      data: { leaveTypeId: sick.id }
    });
    console.log(`Re-linked ${res.count} requests from 'Sick Leave' to 'Sick'`);
  }

  if (casualLeave) {
    const res = await prisma.leaveRequest.updateMany({
      where: { leaveTypeId: casualLeave.id },
      data: { leaveTypeId: casual.id }
    });
    console.log(`Re-linked ${res.count} requests from 'Casual Leave' to 'Casual'`);
  }

  // 3. Delete old leave types
  if (annualLeave) {
    await prisma.leaveType.delete({ where: { id: annualLeave.id } });
    console.log("Deleted 'Annual Leave' leave type");
  }
  if (sickLeave) {
    await prisma.leaveType.delete({ where: { id: sickLeave.id } });
    console.log("Deleted 'Sick Leave' leave type");
  }
  if (casualLeave) {
    await prisma.leaveType.delete({ where: { id: casualLeave.id } });
    console.log("Deleted 'Casual Leave' leave type");
  }

  console.log("--- Migration Completed Successfully ---");
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
