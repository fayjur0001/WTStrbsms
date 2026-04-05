import Role from "@/types/role.type";
import getOpenedTicketCount from "./get-opened-ticket-count";
import getUnreadMessageCount from "./get-unread-message-count";

export default async function getCount(userId: number, role: Role) {
  const [openedTicketCount, unreadMessageCount] = await Promise.all([
    getOpenedTicketCount(userId, role),
    getUnreadMessageCount(userId),
  ]);

  return openedTicketCount + unreadMessageCount;
}
