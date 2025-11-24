import { Result, failure, success } from "../../common";
import { generateInternalId } from "../../utils/id-generator";
import type { IMessageReactionRepository } from "../repositories/message-reaction.repository.interface";
import type { IMessageRepository } from "../repositories/message.repository.interface";
import type { AppUserRepository } from "../../users/repositories";

export interface MessageReactionItem {
  id: string;
  messageId: string;
  userId: string;
  emoji: string;
  createdAt: Date;
  userName: string | null;
  userDisplayName: string | null;
}

export interface MessageReactionSummary {
  emoji: string;
  count: number;
  userReacted: boolean;
}

export class MessageReactionService {
  constructor(
    private readonly messageReactionRepository: IMessageReactionRepository,
    private readonly messageRepository: IMessageRepository,
    private readonly appUserRepository: AppUserRepository
  ) {}

  async addReaction(
    userId: string,
    messageId: string,
    emoji: string
  ): Promise<Result<{ reactionId: string }>> {
    try {
      const appUser = await this.appUserRepository.findByUserId(userId);
      if (!appUser) {
        return failure("User not found", 404);
      }

      const message = await this.messageRepository.findById(messageId);
      if (!message) {
        return failure("Message not found", 404);
      }

      const existingReactions =
        await this.messageReactionRepository.findByMessageIdAndUserId(
          messageId,
          userId
        );

      const existingReaction = existingReactions.find((r) => r.emoji === emoji);
      if (existingReaction) {
        await this.messageReactionRepository.delete(existingReaction.id);
        return success({ reactionId: existingReaction.id });
      }

      const reaction = await this.messageReactionRepository.create({
        id: generateInternalId(),
        messageId,
        userId: appUser.id,
        emoji,
      });

      return success({ reactionId: reaction.id });
    } catch (error) {
      return failure((error as Error).message, 500);
    }
  }

  async removeReaction(
    userId: string,
    reactionId: string
  ): Promise<Result<{ success: boolean }>> {
    try {
      const appUser = await this.appUserRepository.findByUserId(userId);
      if (!appUser) {
        return failure("User not found", 404);
      }

      const reactions =
        await this.messageReactionRepository.findByMessageIdAndUserId(
          "",
          userId
        );
      const reaction = reactions.find((r) => r.id === reactionId);

      if (!reaction) {
        return failure("Reaction not found", 404);
      }

      if (reaction.userId !== appUser.id) {
        return failure("You can only remove your own reactions", 403);
      }

      await this.messageReactionRepository.delete(reactionId);

      return success({ success: true });
    } catch (error) {
      return failure((error as Error).message, 500);
    }
  }

  async getMessageReactions(
    messageId: string,
    currentUserId?: string
  ): Promise<Result<MessageReactionSummary[]>> {
    try {
      const reactions = await this.messageReactionRepository.findByMessageId(
        messageId
      );

      let currentAppUserId: string | null = null;
      if (currentUserId) {
        const appUser = await this.appUserRepository.findByUserId(
          currentUserId
        );
        currentAppUserId = appUser?.id || null;
      }

      const emojiMap = new Map<string, MessageReactionSummary>();

      for (const reaction of reactions) {
        const existing = emojiMap.get(reaction.emoji);
        const userReacted =
          currentAppUserId !== null && reaction.userId === currentAppUserId;

        if (existing) {
          existing.count++;
          if (userReacted) {
            existing.userReacted = true;
          }
        } else {
          emojiMap.set(reaction.emoji, {
            emoji: reaction.emoji,
            count: 1,
            userReacted,
          });
        }
      }

      return success(Array.from(emojiMap.values()));
    } catch (error) {
      return failure((error as Error).message, 500);
    }
  }

  async getMessageReactionsWithUsers(
    messageId: string
  ): Promise<Result<MessageReactionItem[]>> {
    try {
      const reactions = await this.messageReactionRepository.findByMessageId(
        messageId
      );

      const reactionsWithUsers = await Promise.all(
        reactions.map(async (reaction) => {
          const appUser = await this.appUserRepository.findByAppUserId(
            reaction.userId
          );
          const userName = appUser
            ? await this.appUserRepository.findUserNameByUserId(appUser.userId)
            : null;
          const identityCard = appUser
            ? await this.appUserRepository.findIdentityCardByUserId(
                appUser.userId
              )
            : null;

          return {
            id: reaction.id,
            messageId: reaction.messageId,
            userId: appUser?.userId || reaction.userId,
            emoji: reaction.emoji,
            createdAt: reaction.createdAt,
            userName,
            userDisplayName: identityCard?.displayName || null,
          };
        })
      );

      return success(reactionsWithUsers);
    } catch (error) {
      return failure((error as Error).message, 500);
    }
  }
}
