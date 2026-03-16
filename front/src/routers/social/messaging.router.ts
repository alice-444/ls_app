import { router } from "../../lib/trpc";
import { messagingConversationRouter } from "./messaging-conversation.router";
import { messagingMessageRouter } from "./messaging-message.router";
import { messagingReactionRouter } from "./messaging-reaction.router";
import { messagingPresenceRouter } from "./messaging-presence.router";

export const messagingRouter = router({
  ...messagingConversationRouter._def.procedures,
  ...messagingMessageRouter._def.procedures,
  ...messagingReactionRouter._def.procedures,
  ...messagingPresenceRouter._def.procedures,
});
