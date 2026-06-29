from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from transactions.models import Transaction
from budgets.models import MonthlyBudget, BudgetAlertEvent
from budgets.services import mtd_spend, get_user_timezone, compute_user_month_window
from transactions.rewards import calculate_total_rewards
from django.utils import timezone as django_timezone

MONTH_NAMES = {
    "01": "January",
    "02": "February",
    "03": "March",
    "04": "April",
    "05": "May",
    "06": "June",
    "07": "July",
    "08": "August",
    "09": "September",
    "10": "October",
    "11": "November",
    "12": "December",
}


def _current_year_month(user) -> str:
    tz = get_user_timezone(user)
    return django_timezone.now().astimezone(tz).strftime("%Y-%m")


def _format_month_label(year_month: str) -> str:
    year, month = year_month.split("-", 1)
    month_name = MONTH_NAMES.get(month, month)
    return f"{month_name} {year}"


def _build_budget_status_item(user, budget: MonthlyBudget) -> dict:
    spent = mtd_spend(user, budget.year_month)
    amount = budget.amount
    percentage_used = float(spent / amount * 100) if amount > 0 else 0.0
    return {
        "id": budget.id,
        "year_month": budget.year_month,
        "amount": float(amount),
        "spent": float(spent),
        "remaining": float(amount - spent),
        "percentage_used": percentage_used,
        "category": {
            "name": f"Monthly Budget ({_format_month_label(budget.year_month)})",
        },
    }


class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        current_month = _current_year_month(user)
        now_utc = django_timezone.now()
        tz = get_user_timezone(user)
        month_start_utc, _month_end_utc = compute_user_month_window(user, now_utc)

        total_spent = mtd_spend(user, current_month)
        rewards_earned = calculate_total_rewards(user, start_date=month_start_utc)

        active_budgets_qs = MonthlyBudget.objects.filter(
            user=user,
            year_month__gte=current_month,
        ).order_by("year_month")
        active_budgets = active_budgets_qs.count()
        budget_status = [
            _build_budget_status_item(user, budget)
            for budget in active_budgets_qs[:3]
        ]

        recent_transactions = (
            Transaction.objects.filter(
                user=user,
                created_at__gte=month_start_utc,
            )
            .order_by("-created_at")[:3]
        )
        transactions_data = []
        for t in recent_transactions:
            transactions_data.append(
                {
                    "id": t.id,
                    "merchant": t.merchant,
                    "amount": float(t.amount),
                    "category": t.category,
                    "date": t.created_at.astimezone(tz).strftime("%Y-%m-%d"),
                    "created_at": t.created_at.isoformat(),
                }
            )

        budget_alerts_count = BudgetAlertEvent.objects.filter(
            user=user,
            status="pending",
        ).count()

        return Response(
            {
                "success": True,
                "data": {
                    "summary": {
                        "total_spent_this_month": float(total_spent),
                        "total_rewards_this_month": float(rewards_earned),
                        "active_budgets": active_budgets,
                        "budget_alerts": budget_alerts_count,
                    },
                    "budget_status": budget_status,
                    "recent_transactions": transactions_data,
                },
            }
        )
