import { api } from "./api";
import type { Notification, NotificationPayload } from "../types";

export function getNotifications(): Promise<Notification[]> {
  return api<{ data: Notification[] }>("/notifications").then(
    (res) => res.data
  );
}

export function postNotification(payload: NotificationPayload): Promise<void> {
  return api("/notifications", { method: "POST", body: payload }).then(
    () => undefined
  );
}

/** Fire-and-forget notification used by forms and sale flows. */
export async function postNotifications({
  type,
  title,
  message,
  userInvolved,
  itemInvolved,
}: {
  type: string;
  title: string;
  message: string;
  userInvolved?: string;
  itemInvolved?: string;
}): Promise<void> {
  try {
    const body: NotificationPayload = {
      notificationType: type,
      notificationTitle: title,
      notificationMessage: message,
    };
    if (userInvolved) body.notificationUserInvolved = userInvolved;
    if (itemInvolved) body.notificationItemInvolved = itemInvolved;

    await postNotification(body);
  } catch {
    // Notifications are best-effort; failures must not break the main flow.
  }
}

export function deleteNotification(id: string): Promise<void> {
  return api(`/notifications/${id}`, { method: "DELETE" }).then(
    () => undefined
  );
}
