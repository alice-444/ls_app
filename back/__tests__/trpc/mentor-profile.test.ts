import { describe, it, expect, beforeAll } from "vitest";
import { prisma } from "../../src/lib/common/prisma";
import { mentorRouter } from "../../src/routers/mentors/mentor.router";
import { connectionRouter } from "../../src/routers/social/connection.router";
import { t } from "../../src/lib/trpc";

const createMentorCaller = t.createCallerFactory(mentorRouter);
const createConnectionCaller = t.createCallerFactory(connectionRouter);

describe("Mentor Public Profile Functional Validation", () => {
  let mentorId: string;
  let mentorUserId: string;
  let apprenticeUserId: string;

  beforeAll(async () => {
    // Setup Mentor
    const mentorUser = await prisma.user.upsert({
      where: { userId: "test-mentor-profile" },
      update: { role: "MENTOR", status: "ACTIVE", isPublished: true, publishedAt: new Date() },
      create: {
        userId: "test-mentor-profile",
        name: "Test Mentor Profile",
        email: "mentor-profile@test.com",
        role: "MENTOR",
        status: "ACTIVE",
        isPublished: true,
        publishedAt: new Date(),
      },
    });
    mentorId = mentorUser.id;
    mentorUserId = mentorUser.userId;

    await prisma.account.upsert({
      where: { accountId: "test-mentor-profile" },
      update: { userId: mentorId },
      create: {
        id: "test-mentor-profile",
        accountId: "test-mentor-profile",
        userId: mentorId,
        email: "mentor-profile@test.com",
        isEmailVerified: true,
        failedLoginAttempts: 0,
        isLocked: false,
        lastLogin: new Date(),
      },
    });

    // Setup Apprentice
    const apprenticeUser = await prisma.user.upsert({
      where: { userId: "test-apprentice-profile" },
      update: { role: "APPRENANT", status: "ACTIVE" },
      create: {
        userId: "test-apprentice-profile",
        name: "Test Apprentice Profile",
        email: "apprentice-profile@test.com",
        role: "APPRENANT",
        status: "ACTIVE",
      },
    });
    apprenticeUserId = apprenticeUser.id;

    await prisma.account.upsert({
      where: { accountId: "test-apprentice-profile" },
      update: { userId: apprenticeUserId },
      create: {
        id: "test-apprentice-profile",
        accountId: "test-apprentice-profile",
        userId: apprenticeUserId,
        email: "apprentice-profile@test.com",
        isEmailVerified: true,
        failedLoginAttempts: 0,
        isLocked: false,
        lastLogin: new Date(),
      },
    });

    // Create a workshop for the mentor
    await prisma.workshop.upsert({
      where: { id: "test-workshop-id" },
      update: {
        creatorId: mentorId,
        status: "PUBLISHED",
        date: new Date("2099-01-01"),
      },
      create: {
        id: "test-workshop-id",
        creatorId: mentorId,
        title: "Test Workshop",
        description: "Test Description",
        status: "PUBLISHED",
        date: new Date("2099-01-01"),
        time: "10:00",
        domain: "Design",
      }
    });
  });

  it("should fetch mentor public profile correctly", async () => {
    const caller = createMentorCaller({ session: null } as any);
    const profile = await caller.getPublicProfile({ mentorId });
    
    expect(profile.id).toBe(mentorId);
    expect(profile.displayName).toBe("Test Mentor Profile");
    expect(profile.workshops).toHaveLength(1);
  });

  it("should fetch mentor workshops separately", async () => {
    const caller = createMentorCaller({ session: { user: { id: apprenticeUserId } } } as any);
    const workshops = await caller.getPublicWorkshops({ mentorId });
    
    expect(workshops.upcoming).toHaveLength(1);
    expect(workshops.upcoming[0].title).toBe("Test Workshop");
  });

  it("should check connection status between apprentice and mentor", async () => {
    const caller = createConnectionCaller({ session: { user: { id: apprenticeUserId } } } as any);
    const status = await caller.checkConnectionStatus({ otherUserId: mentorUserId });
    
    // The service returns null if no connection exists
    expect(status.status).toBeNull();
  });

  it("should fetch mentor feedbacks (empty initially)", async () => {
    const caller = createMentorCaller({ session: null } as any);
    const feedbacks = await caller.getFeedbacks({ mentorId });
    
    expect(feedbacks.feedbacks).toHaveLength(0);
    expect(feedbacks.aggregate.totalCount).toBe(0);
  });
});
