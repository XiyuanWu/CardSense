from datetime import datetime, timedelta
from decimal import Decimal
from django.utils import timezone
from django.db.models import Sum
from django.conf import settings
from transactions.models import Transaction
from .models import MonthlyBudget, BudgetAlertEvent
from zoneinfo import ZoneInfo


def get_user_timezone(user):
    """Get user's timezone from Profile if available, else UTC."""
    # TODO: when Profile model exists, read timezone from there
    # For now, defaulting to UTC
    try:
        # If Profile model exists later, uncomment:
        # profile = user.profile
        # if profile and profile.timezone:
        #     return ZoneInfo(profile.timezone)
        pass
    except:
        pass
    return ZoneInfo('UTC')


def compute_user_month_window(user, dt_utc):
    """
    Given a UTC datetime, compute the start and end of that month in the user's timezone.
    Returns (start_utc, end_utc) as timezone-aware datetimes.
    """
    tz = get_user_timezone(user)
    # Convert UTC to user's TZ
    dt_user_tz = dt_utc.astimezone(tz)
    # Get first day of month at 00:00:00 in user's TZ
    start_user_tz = dt_user_tz.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    # Get last day of month - compute next month's first day then subtract 1 day
    if dt_user_tz.month == 12:
        next_month_start = dt_user_tz.replace(year=dt_user_tz.year + 1, month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
    else:
        next_month_start = dt_user_tz.replace(month=dt_user_tz.month + 1, day=1, hour=0, minute=0, second=0, microsecond=0)
    end_user_tz = next_month_start - timedelta(days=1)
    end_user_tz = end_user_tz.replace(hour=23, minute=59, second=59, microsecond=999999)
    # Convert back to UTC for DB queries
    utc_tz = ZoneInfo('UTC')
    start_utc = start_user_tz.astimezone(utc_tz)
    end_utc = end_user_tz.astimezone(utc_tz)
    return start_utc, end_utc


def mtd_spend(user, year_month):
    """
    Sum all transaction amounts for the user within the given year_month.
    year_month is in YYYY-MM format.
    """
    # Parse year_month to get a datetime in that month
    year, month = map(int, year_month.split('-'))
    tz = get_user_timezone(user)
    # Create a datetime in the middle of that month in user's TZ, then convert to UTC
    dt_user_tz = datetime(year, month, 15, tzinfo=tz)
    utc_tz = ZoneInfo('UTC')
    dt_utc = dt_user_tz.astimezone(utc_tz)
    
    start_utc, end_utc = compute_user_month_window(user, dt_utc)
    
    # Sum transactions in that window
    result = Transaction.objects.filter(
        user=user,
        created_at__gte=start_utc,
        created_at__lte=end_utc
    ).aggregate(total=Sum('amount'))
    
    return result['total'] or Decimal('0.00')


def evaluate_thresholds(budget, mtd):
    """
    Check if MTD spend has crossed any thresholds. Create alert events and update fired_flags.
    Only fires alerts for thresholds that haven't been fired yet.
    """
    if budget.amount == 0:
        return
    
    percent_used = float(mtd / budget.amount)
    thresholds = budget.thresholds if isinstance(budget.thresholds, list) else [0.5, 0.7, 0.9]
    fired_flags = budget.fired_flags if isinstance(budget.fired_flags, list) else []
    
    # Check each threshold
    for threshold in thresholds:
        threshold_float = float(threshold)
        # Only fire if we've crossed it and haven't fired yet
        if percent_used >= threshold_float and threshold_float not in fired_flags:
            # Create alert event
            BudgetAlertEvent.objects.create(
                user=budget.user,
                year_month=budget.year_month,
                threshold=Decimal(str(threshold_float)),
                spend_at_fire=mtd,
                status='pending'
            )
            # Add to fired_flags
            fired_flags.append(threshold_float)
    
    # Update budget with new fired_flags
    budget.fired_flags = fired_flags
    budget.save(update_fields=['fired_flags'])

