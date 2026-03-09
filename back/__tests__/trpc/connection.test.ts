import { describe, it, expect, beforeAll } from "vitest";
import { prisma } from "../../src/lib/common/prisma";
import { connectionRouter } from "../../src/routers/social/connection.router";
import { t } from "../../src/lib/trpc";

const createConnectionCaller = t.createCallerFactory(connectionRouter);

describe("Connection System Functional Validation (PRP 10)", () => {
  let user1Id: string;
  let user2Id: string;

  beforeAll(async () => {
    // Setup User 1 (Requester)
    const u1 = await prisma.user.upsert({
      where: { userId: "net-user-1" },
      update: { role: "APPRENANT", status: "ACTIVE" },
      create: {
        id: "net-user-1",
        userId: "net-user-1",
        name: "User 1",
        email: "user1@net.com",
        role: "APPRENANT",
        status: "ACTIVE",
      },
    });
    user1Id = u1.id;

    await prisma.account.upsert({
      where: { accountId: "net-user-1" },
      update: { userId: user1Id },
      create: {
        id: "net-user-1",
        accountId: "net-user-1",
        userId: user1Id,
        email: "user1@net.com",
        isEmailVerified: true,
        failedLoginAttempts: 0,
        isLocked: false,
        lastLogin: new Date(),
      },
    });

    // Setup User 2 (Receiver)
    const u2 = await prisma.user.upsert({
      where: { userId: "net-user-2" },
      update: { role: "MENTOR", status: "ACTIVE" },
      create: {
        id: "net-user-2",
        userId: "net-user-2",
        name: "User 2",
        email: "user2@net.com",
        role: "MENTOR",
        status: "ACTIVE",
      },
    });
    user2Id = u2.id;

    await prisma.account.upsert({
      where: { accountId: "net-user-2" },
      update: { userId: user2Id },
      create: {
        id: "net-user-2",
        accountId: "net-user-2",
        userId: user2Id,
        email: "user2@net.com",
        isEmailVerified: true,
        failedLoginAttempts: 0,
        isLocked: false,
        lastLogin: new Date(),
      },
    });

    // Clean up existing connections
    await prisma.user_connection.deleteMany({
      where: {
        OR: [
          { requester: { userId: user1Id }, receiver: { userId: user2Id } },
          { requester: { userId: user2Id }, receiver: { userId: user1Id } },
        ],
      },
    });
  });

  it("should send a connection request", async () => {
    const caller = createConnectionCaller({ session: { user: { id: user1Id } } } as any);
    const result = await caller.sendConnectionRequest({ receiverUserId: user2Id });
    
    expect(result.success).toBe(true);

    const connection = await prisma.user_connection.findFirst({
      where: { requester: { userId: user1Id }, receiver: { userId: user2Id } },
    });
    expect(connection).toBeDefined();
    expect(connection?.status).toBe("PENDING");
  });

  it("should list pending requests sent", async () => {
    const caller = createConnectionCaller({ session: { user: { id: user1Id } } } as any);
    const sent = await caller.getPendingRequestsSent();
    
    expect(sent).toHaveLength(1);
    expect(sent[0].receiverUserId).toBe(user2Id);
  });

  it("should list pending requests received", async () => {
    const caller = createConnectionCaller({ session: { user: { id: user2Id } } } as any);
    const received = await caller.getPendingRequestsReceived();
    
    expect(received).toHaveLength(1);
    expect(received[0].requesterUserId).toBe(user1Id);
  });

  it("should accept a connection request", async () => {
    const receiverCaller = createConnectionCaller({ session: { user: { id: user2Id } } } as any);
    const received = await receiverCaller.getPendingRequestsReceived();
    const connectionId = received[0].connectionId;

    const result = await receiverCaller.acceptConnectionRequest({ connectionId });
    expect(result.success).toBe(true);

    const connection = await prisma.user_connection.findUnique({
      where: { id: connectionId },
    });
    expect(connection?.status).toBe("ACCEPTED");
  });

  it("should list accepted connections", async () => {
    const caller = createConnectionCaller({ session: { user: { id: user1Id } } } as any);
    const connections = await caller.getAcceptedConnections();
    
    expect(connections).toHaveLength(1);
    expect(connections[0].otherUserId).toBe(user2Id);
  });

  it("should remove an existing connection", async () => {
    const caller = createConnectionCaller({ session: { user: { id: user1Id } } } as any);
    const result = await caller.removeConnection({ otherUserId: user2Id });
    
    expect(result.success).toBe(true);

    const connection = await prisma.user_connection.findFirst({
      where: {
        OR: [
          { requester: { userId: user1Id }, receiver: { userId: user2Id } },
          { requester: { userId: user2Id }, receiver: { userId: user1Id } },
        ],
      },
    });
    expect(connection).toBeNull();
  });
});
