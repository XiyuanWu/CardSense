from datetime import timedelta

from django.utils import timezone

from .models import ChatMessage

CHAT_HISTORY_TTL_DAYS = 7
CHAT_HISTORY_MAX_MESSAGES = 100


def prune_old_messages(user) -> None:
    cutoff = timezone.now() - timedelta(days=CHAT_HISTORY_TTL_DAYS)
    ChatMessage.objects.filter(user=user, created_at__lt=cutoff).delete()


def get_user_chat_history(user) -> list[dict[str, str]]:
    prune_old_messages(user)
    rows = (
        ChatMessage.objects.filter(user=user)
        .order_by("created_at")
        .values("role", "content")[:CHAT_HISTORY_MAX_MESSAGES]
    )
    return [{"role": row["role"], "content": row["content"]} for row in rows]


def append_chat_exchange(user, user_content: str, assistant_content: str) -> None:
    ChatMessage.objects.create(
        user=user,
        role=ChatMessage.ROLE_USER,
        content=user_content.strip(),
    )
    ChatMessage.objects.create(
        user=user,
        role=ChatMessage.ROLE_ASSISTANT,
        content=assistant_content.strip(),
    )
    prune_old_messages(user)
