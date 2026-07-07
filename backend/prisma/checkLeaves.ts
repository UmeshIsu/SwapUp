import prisma from './prismaClient';

async function main() {
  console.log("--- Fetching LeaveTypes ---");
  const leaveTypes = await prisma.leaveType.findMany({
    include: {
      _count: {
        select: { leaveRequests: true }
      }
    }
  });
  console.log(JSON.stringify(leaveTypes, null, 2));

  console.log("\n--- Fetching LeaveRequests ---");
  const leaveRequests = await prisma.leaveRequest.findMany({
    include: {
      leaveType: true
    }
  });
  console.log(JSON.stringify(leaveRequests, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
