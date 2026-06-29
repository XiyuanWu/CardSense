import json
from typing import Any

from django.conf import settings
from openai import OpenAI

from cards.models import RewardRule, UserCard
from optimizer.services import best_cards_for_category

CATEGORY_KEYWORDS: dict[str, list[str]] = {
    "GAS": ["gas", "fuel", "gas station", "petrol", "shell", "chevron", "exxon"],
    "GROCERIES": ["grocery", "groceries", "supermarket", "whole foods", "costco", "walmart grocery"],
    "DINING": ["dining", "restaurant", "food", "eat out", "takeout", "uber eats", "doordash"],
    "ONLINE_SHOPPING": ["online shopping", "amazon", "ecommerce", "online purchase"],
    "PHARMACY": ["pharmacy", "drugstore", "cvs", "walgreens"],
    "GENERAL_TRAVEL": ["travel", "trip", "vacation"],
    "AIRLINE_TRAVEL": ["airline", "flight", "airfare"],
    "HOTEL_TRAVEL": ["hotel", "lodging", "airbnb"],
    "TRANSIT": ["transit", "uber", "lyft", "rideshare", "parking", "toll"],
    "ENTERTAINMENT": ["entertainment", "movie", "streaming", "concert"],
    "RENT": ["rent", "housing"],
    "OTHER": ["everything else", "general", "any purchase"],
}

CATEGORY_LABELS = dict(RewardRule.CATEGORY_CHOICES)


def _category_display(tag: str) -> str:
    return CATEGORY_LABELS.get(tag, tag.replace("_", " ").title())


def build_wallet_context(user) -> list[dict[str, Any]]:
    user_cards = (
        UserCard.objects.filter(user=user, is_active=True)
        .select_related("card")
        .prefetch_related("card__reward_rules")
    )
    wallet: list[dict[str, Any]] = []
    for uc in user_cards:
        card = uc.card
        rules = []
        for rule in card.reward_rules.all():
            categories = rule.category if isinstance(rule.category, list) else [rule.category]
            rules.append(
                {
                    "multiplier": float(rule.multiplier or 0),
                    "categories": [_category_display(c) for c in categories if c],
                    "cap_amount": float(rule.cap_amount) if rule.cap_amount is not None else None,
                    "notes": rule.notes or "",
                }
            )
        wallet.append(
            {
                "card_id": card.id,
                "name": f"{card.issuer} {card.name}",
                "annual_fee": float(card.annual_fee or 0),
                "foreign_transaction_fee": bool(card.ftf),
                "reward_rules": rules,
                "notes": uc.notes or "",
            }
        )
    return wallet


def infer_categories_from_message(message: str) -> list[str]:
    text = message.lower()
    found: list[str] = []
    for tag, keywords in CATEGORY_KEYWORDS.items():
        if tag == "OTHER":
            continue
        for kw in keywords:
            if kw in text:
                found.append(tag)
                break
    return list(dict.fromkeys(found))


def build_optimizer_hints(user, message: str) -> list[dict[str, Any]]:
    categories = infer_categories_from_message(message)
    if not categories:
        categories = ["GAS", "GROCERIES", "DINING", "OTHER"]

    hints: list[dict[str, Any]] = []
    for tag in categories[:4]:
        result = best_cards_for_category(tag, user)
        hints.append(
            {
                "category": _category_display(tag),
                "category_tag": tag,
                "best_card": result.get("best_card"),
                "multiplier": result.get("multiplier"),
                "rationale": result.get("rationale"),
                "alternatives": result.get("top3", []),
            }
        )
    return hints


def _build_system_prompt(wallet: list[dict], hints: list[dict]) -> str:
    return (
        "You are CardSense Assistant, a helpful credit-card rewards advisor. "
        "Answer using ONLY the user's wallet and optimizer data below. "
        "If they have no cards, tell them to add cards in the Cards section first. "
        "Be concise, friendly, and name specific cards from their wallet. "
        "Mention multipliers (e.g. 3×) when relevant. "
        "Do not invent cards or reward rates not in the data.\n\n"
        f"USER WALLET (JSON):\n{json.dumps(wallet, indent=2)}\n\n"
        f"OPTIMIZER HINTS FOR THIS QUESTION (JSON):\n{json.dumps(hints, indent=2)}"
    )


def _normalize_history(history: list) -> list[dict[str, str]]:
    messages: list[dict[str, str]] = []
    for item in history[-10:]:
        if not isinstance(item, dict):
            continue
        role = item.get("role")
        content = item.get("content")
        if role in ("user", "assistant") and isinstance(content, str) and content.strip():
            messages.append({"role": role, "content": content.strip()})
    return messages


def generate_chat_reply(user, message: str, history: list | None = None) -> dict[str, Any]:
    message = (message or "").strip()
    if not message:
        return {"reply": "Please enter a question about your cards or rewards.", "hints": []}

    wallet = build_wallet_context(user)
    hints = build_optimizer_hints(user, message)

    if not settings.OPENAI_API_KEY:
        return _fallback_reply(wallet, hints, message)

    client = OpenAI(api_key=settings.OPENAI_API_KEY)
    messages = [{"role": "system", "content": _build_system_prompt(wallet, hints)}]
    messages.extend(_normalize_history(history or []))
    messages.append({"role": "user", "content": message})

    try:
        completion = client.chat.completions.create(
            model=settings.OPENAI_CHAT_MODEL,
            messages=messages,
            temperature=0.3,
            max_tokens=600,
        )
        reply = (completion.choices[0].message.content or "").strip()
    except Exception as exc:
        return {
            "reply": (
                "I could not reach the AI service right now. "
                f"Here is a quick answer from your wallet data instead.\n\n{_fallback_text(wallet, hints)}"
            ),
            "hints": hints,
            "error": str(exc),
        }

    return {"reply": reply, "hints": hints}


def _fallback_text(wallet: list[dict], hints: list[dict]) -> str:
    if not wallet:
        return "You have no active cards in your wallet. Add cards first, then ask again."

    lines = ["Based on your wallet:"]
    for hint in hints:
        best = hint.get("best_card")
        if best:
            lines.append(
                f"- {hint['category']}: use **{best['card_name']}** ({hint['multiplier']}×). "
                f"{hint.get('rationale', '')}"
            )
        else:
            lines.append(f"- {hint['category']}: no recommendation available.")
    return "\n".join(lines)


def _fallback_reply(wallet: list[dict], hints: list[dict], message: str) -> dict[str, Any]:
    if not settings.OPENAI_API_KEY:
        prefix = (
            "AI chat is not configured yet. Add `OPENAI_API_KEY` to your `.env` file and restart the backend.\n\n"
        )
    else:
        prefix = ""
    return {
        "reply": prefix + _fallback_text(wallet, hints),
        "hints": hints,
        "used_fallback": True,
    }
