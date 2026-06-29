import json
import logging
from typing import Any

import google.generativeai as genai
from django.conf import settings

from cards.models import RewardRule, UserCard
from optimizer.services import best_cards_for_category

logger = logging.getLogger(__name__)

CATEGORY_KEYWORDS: dict[str, list[str]] = {
    "GAS": ["gas", "fuel", "gas station", "petrol", "shell", "chevron", "exxon"],
    "GROCERIES": ["grocery", "groceries", "supermarket", "whole foods", "costco"],
    "DINING": ["dining", "restaurant", "eat out", "takeout", "doordash", "uber eats"],
    "ONLINE_SHOPPING": ["online shopping", "amazon", "ecommerce"],
    "PHARMACY": ["pharmacy", "drugstore", "cvs", "walgreens"],
    "GENERAL_TRAVEL": ["travel", "trip", "vacation"],
    "AIRLINE_TRAVEL": ["airline", "flight", "airfare"],
    "HOTEL_TRAVEL": ["hotel", "lodging", "airbnb"],
    "TRANSIT": ["transit", "uber", "lyft", "rideshare", "parking", "toll"],
    "ENTERTAINMENT": ["entertainment", "movie", "streaming", "concert"],
    "RENT": ["rent", "housing"],
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
        for kw in keywords:
            if kw in text:
                found.append(tag)
                break
    return list(dict.fromkeys(found))


def build_optimizer_hints(user, message: str) -> list[dict[str, Any]]:
    hints: list[dict[str, Any]] = []
    for tag in infer_categories_from_message(message)[:4]:
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
    hints_block = (
        json.dumps(hints, indent=2)
        if hints
        else "[]  (no specific category detected — answer from wallet and general rewards advice)"
    )
    return (
        "You are CardSense Assistant, a personal credit-card and savings advisor.\n"
        "Use ONLY the user's wallet data below. Do not invent cards or reward rates.\n"
        "You can answer:\n"
        "- which card to use for a purchase category\n"
        "- how to maximize rewards across their wallet\n"
        "- general money-saving tips tied to their cards (fees, multipliers, using the right card)\n"
        "If they have no cards, tell them to add cards in the Cards section first.\n"
        "Be concise, friendly, and specific.\n\n"
        f"USER WALLET (JSON):\n{json.dumps(wallet, indent=2)}\n\n"
        f"CATEGORY OPTIMIZER HINTS (JSON):\n{hints_block}"
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


def _to_gemini_history(history: list) -> list[dict[str, Any]]:
    gemini_history: list[dict[str, Any]] = []
    for item in _normalize_history(history):
        role = "model" if item["role"] == "assistant" else "user"
        gemini_history.append({"role": role, "parts": [item["content"]]})
    return gemini_history


def _extract_gemini_text(response) -> str:
    try:
        text = (response.text or "").strip()
        if text:
            return text
    except ValueError:
        pass
    return ""


def _classify_gemini_error(exc: Exception) -> tuple[str, str]:
    text = str(exc).lower()
    if "quota" in text or "429" in text or "resource_exhausted" in text:
        return (
            "gemini_quota",
            "Gemini rejected the request: quota or rate limit exceeded. "
            "Check usage at https://aistudio.google.com/ or try again later.",
        )
    if "api key" in text or "api_key" in text or "permission" in text:
        return (
            "gemini_invalid_key",
            "Gemini rejected the API key. Check GEMINI_API_KEY in .env and restart Django.",
        )
    if "no longer available" in text or ("404" in text and "model" in text):
        return (
            "gemini_model",
            "That Gemini model was retired. Set GEMINI_MODEL=gemini-2.5-flash in .env "
            "and restart Django.",
        )
    return ("gemini_error", f"Gemini request failed: {exc}")


def generate_chat_reply(user, message: str, history: list | None = None) -> dict[str, Any]:
    message = (message or "").strip()
    if not message:
        return {"reply": "Please enter a question about your cards or rewards.", "hints": []}

    wallet = build_wallet_context(user)
    hints = build_optimizer_hints(user, message)

    api_key = (settings.GEMINI_API_KEY or "").strip()
    if not api_key:
        return {
            "reply": (
                "Assistant needs Google Gemini to answer. Add GEMINI_API_KEY to the .env file "
                "at the project root, then restart the Django server."
            ),
            "hints": hints,
            "error_code": "no_api_key",
        }

    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel(
            model_name=settings.GEMINI_CHAT_MODEL,
            system_instruction=_build_system_prompt(wallet, hints),
        )
        chat_session = model.start_chat(history=_to_gemini_history(history or []))
        response = chat_session.send_message(
            message,
            generation_config={"temperature": 0.4, "max_output_tokens": 700},
        )
        reply = _extract_gemini_text(response)
        if not reply:
            return {
                "reply": "Gemini returned an empty response. Please try again.",
                "hints": hints,
                "error_code": "gemini_empty",
            }
    except Exception as exc:
        code, user_message = _classify_gemini_error(exc)
        logger.warning("Gemini chat failed [%s]: %s", code, exc)
        return {
            "reply": user_message,
            "hints": hints,
            "error_code": code,
            "error": str(exc),
        }

    return {"reply": reply, "hints": hints}
