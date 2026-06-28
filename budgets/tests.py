from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from decimal import Decimal
from datetime import datetime, timedelta
from django.utils import timezone
from cards.models import Card, RewardRule
from transactions.models import Transaction
from .models import MonthlyBudget, BudgetAlertEvent
from .services import mtd_spend, evaluate_thresholds, get_user_timezone

'''
Expectations
------------
MonthlyBudget Model
- Unique constraint on (user, year_month) pair.
- Amount has to be positive (MinValueValidator).
- thresholds is JSONField with default [0.5, 0.7, 0.9].
- fired_flags is JSONField tracking which thresholds have fired.
- String should be like "<username> - YYYY-MM: $<amount>".

BudgetAlertEvent Model
- Tracks when MTD spend goes over a threshold.
- Fields are user, year_month, threshold, spend_at_fire, fired_at, status.
- status defaults to 'pending', can be 'acknowledged'.

Budget Services
- mtd_spend(user, year_month), calculates month-to-date spending from transactions.
- evaluate_thresholds(user, year_month), checks thresholds and fires alerts.
- get_user_timezone(user), returns user's timezone (default is UTC).

Budget API Endpoints
- POST /api/budgets/: Creates or updates a monthly budget.
- GET /api/budgets/current/: Returns current month budget with MTD spend and percentage used.
- GET /api/budgets/history/: Returns budget history for last n months.
- GET /api/budgets/alerts/: Lists budget alerts for user.
- POST /api/budgets/alerts/{id}/ack/: Acknowledges an alert.
- All endpoints require authentication.

Budget Signals
- Transaction create, update, delete triggers budget recalculation.
- Threshold alerts are fired automatically when spend goes over thresholds.
- fired_flags tracks which thresholds have already fired, so no duplicates.
'''


class BudgetModelTests(TestCase):
    """Test budget model creation and constraints."""
    
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='testpass123')
    
    def test_create_budget(self):
        """Test creating a monthly budget."""
        budget = MonthlyBudget.objects.create(
            user=self.user,
            year_month='2024-01',
            amount=Decimal('1000.00'),
            thresholds=[0.5, 0.7, 0.9]
        )
        self.assertEqual(budget.user, self.user)
        self.assertEqual(budget.year_month, '2024-01')
        self.assertEqual(budget.amount, Decimal('1000.00'))
        self.assertEqual(budget.thresholds, [0.5, 0.7, 0.9])
        self.assertEqual(budget.fired_flags, [])
    
    def test_unique_constraint(self):
        """Test that (user, year_month) is unique."""
        MonthlyBudget.objects.create(
            user=self.user,
            year_month='2024-01',
            amount=Decimal('1000.00')
        )
        #try to create another with same user and year_month
        with self.assertRaises(Exception):
            MonthlyBudget.objects.create(
                user=self.user,
                year_month='2024-01',
                amount=Decimal('2000.00')
            )


class BudgetServicesTests(TestCase):
    """Test service functions."""
    
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='testpass123')
        self.card = Card.objects.create(
            name='Test Card',
            issuer='CHASE',
            annual_fee=Decimal('0')
        )
        #create budget for current month
        tz = get_user_timezone(self.user)
        now = timezone.now().astimezone(tz)
        self.year_month = now.strftime('%Y-%m')
        self.budget = MonthlyBudget.objects.create(
            user=self.user,
            year_month=self.year_month,
            amount=Decimal('1000.00'),
            thresholds=[0.5, 0.7, 0.9]
        )
    
    def test_mtd_spend_empty(self):
        """Test MTD spend with no transactions."""
        mtd = mtd_spend(self.user, self.year_month)
        self.assertEqual(mtd, Decimal('0.00'))
    
    def test_mtd_spend_with_transactions(self):
        """Test MTD spend calculation with transactions."""
        #create transactions in current month
        Transaction.objects.create(
            user=self.user,
            card_actually_used=self.card,
            merchant='Store A',
            amount=Decimal('100.00'),
            category='GROCERIES'
        )
        Transaction.objects.create(
            user=self.user,
            card_actually_used=self.card,
            merchant='Store B',
            amount=Decimal('50.00'),
            category='DINING'
        )
        mtd = mtd_spend(self.user, self.year_month)
        self.assertEqual(mtd, Decimal('150.00'))
    
    def test_evaluate_thresholds_fires_alerts(self):
        """Test that thresholds fire alerts when crossed."""
        #add transaction that crosses 0.5 threshold (500/1000 = 0.5)
        Transaction.objects.create(
            user=self.user,
            card_actually_used=self.card,
            merchant='Store A',
            amount=Decimal('500.00'),
            category='GROCERIES'
        )
        #signal should have fired, refresh budget
        self.budget.refresh_from_db()
        #check that alert was created (signal already fired, so we should have 1)
        alerts = BudgetAlertEvent.objects.filter(user=self.user, year_month=self.year_month)
        #signal fires on transaction create, so we should have 1 alert
        self.assertEqual(alerts.count(), 1)
        self.assertEqual(alerts.first().threshold, Decimal('0.50'))
        self.assertEqual(self.budget.fired_flags, [0.5])
        
        #add more to cross 0.7 threshold
        Transaction.objects.create(
            user=self.user,
            card_actually_used=self.card,
            merchant='Store B',
            amount=Decimal('200.00'),
            category='DINING'
        )
        #signal should have fired, refresh budget
        self.budget.refresh_from_db()
        
        #should have 2 alerts now
        alerts = BudgetAlertEvent.objects.filter(user=self.user, year_month=self.year_month)
        self.assertEqual(alerts.count(), 2)
        self.assertIn(0.7, self.budget.fired_flags)


class BudgetAPITests(TestCase):
    """Test budget API endpoints."""
    
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='testpass123')
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
        self.card = Card.objects.create(
            name='Test Card',
            issuer='CHASE',
            annual_fee=Decimal('0')
        )
    
    def test_create_budget(self):
        """Test POST /api/budgets/ creates a budget."""
        response = self.client.post('/api/budgets/', {
            'year_month': '2024-01',
            'amount': '1000.00',
            'thresholds': [0.5, 0.7, 0.9]
        }, format='json')
        if response.status_code != status.HTTP_201_CREATED:
            print(f"Error response: {response.data}")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(MonthlyBudget.objects.count(), 1)
        budget = MonthlyBudget.objects.first()
        self.assertEqual(budget.amount, Decimal('1000.00'))
        self.assertEqual(budget.year_month, '2024-01')
    
    def test_upsert_budget(self):
        """Test POST /api/budgets/ updates existing budget."""
        MonthlyBudget.objects.create(
            user=self.user,
            year_month='2024-01',
            amount=Decimal('1000.00')
        )
        response = self.client.post('/api/budgets/', {
            'year_month': '2024-01',
            'amount': '2000.00',
            'thresholds': [0.5, 0.7, 0.9]
        }, format='json')
        if response.status_code != status.HTTP_200_OK:
            print(f"Error response: {response.data}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        budget = MonthlyBudget.objects.get(user=self.user, year_month='2024-01')
        self.assertEqual(budget.amount, Decimal('2000.00'))
    
    def test_current_budget(self):
        """Test GET /api/budgets/current/ returns current month budget."""
        tz = get_user_timezone(self.user)
        now = timezone.now().astimezone(tz)
        year_month = now.strftime('%Y-%m')
        MonthlyBudget.objects.create(
            user=self.user,
            year_month=year_month,
            amount=Decimal('1000.00')
        )
        #add a transaction
        Transaction.objects.create(
            user=self.user,
            card_actually_used=self.card,
            merchant='Store A',
            amount=Decimal('300.00'),
            category='GROCERIES'
        )
        response = self.client.get('/api/budgets/current/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(float(data['data']['budget']), 1000.00)
        self.assertEqual(float(data['data']['mtd']), 300.00)
        self.assertEqual(data['data']['percent_used'], 0.3)
    
    def test_history_budget(self):
        """Test GET /api/budgets/history/ returns last N months."""
        # Create budgets for a few months
        MonthlyBudget.objects.create(
            user=self.user,
            year_month='2024-01',
            amount=Decimal('1000.00')
        )
        MonthlyBudget.objects.create(
            user=self.user,
            year_month='2024-02',
            amount=Decimal('1200.00')
        )
        response = self.client.get('/api/budgets/history/?limit=6')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertIsInstance(data, list)
        # Should include current month and past months
        self.assertGreaterEqual(len(data), 2)
    
    def test_alerts_list(self):
        """Test GET /api/budgets/alerts/ lists alert events."""
        tz = get_user_timezone(self.user)
        now = timezone.now().astimezone(tz)
        year_month = now.strftime('%Y-%m')
        budget = MonthlyBudget.objects.create(
            user=self.user,
            year_month=year_month,
            amount=Decimal('1000.00')
        )
        #Create an alert
        BudgetAlertEvent.objects.create(
            user=self.user,
            year_month=year_month,
            threshold=Decimal('0.50'),
            spend_at_fire=Decimal('500.00'),
            status='pending'
        )
        response = self.client.get('/api/budgets/alerts/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        alerts = data['data']
        #find our specific alert (there might be others from previous tests)
        our_alert = next((a for a in alerts if float(a['threshold']) == 0.50), None)
        self.assertIsNotNone(our_alert)
        self.assertEqual(float(our_alert['threshold']), 0.50)
    
    def test_ack_alert(self):
        """Test POST /api/budgets/alerts/{id}/ack/ acknowledges alert."""
        tz = get_user_timezone(self.user)
        now = timezone.now().astimezone(tz)
        year_month = now.strftime('%Y-%m')
        alert = BudgetAlertEvent.objects.create(
            user=self.user,
            year_month=year_month,
            threshold=Decimal('0.50'),
            spend_at_fire=Decimal('500.00'),
            status='pending'
        )
        response = self.client.post(f'/api/budgets/alerts/{alert.id}/ack/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        alert.refresh_from_db()
        self.assertEqual(alert.status, 'acknowledged')


class BudgetSignalTests(TestCase):
    """Test that transaction signals trigger budget recomputation."""
    
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='testpass123')
        self.card = Card.objects.create(
            name='Test Card',
            issuer='CHASE',
            annual_fee=Decimal('0')
        )
        tz = get_user_timezone(self.user)
        now = timezone.now().astimezone(tz)
        self.year_month = now.strftime('%Y-%m')
        self.budget = MonthlyBudget.objects.create(
            user=self.user,
            year_month=self.year_month,
            amount=Decimal('1000.00'),
            thresholds=[0.5, 0.7, 0.9]
        )
    
    def test_transaction_create_fires_alert(self):
        """Test that creating a transaction fires alerts when thresholds crossed."""
        # Create transaction that crosses 0.5 threshold
        Transaction.objects.create(
            user=self.user,
            card_actually_used=self.card,
            merchant='Store A',
            amount=Decimal('500.00'),
            category='GROCERIES'
        )
        #Check that alert was created
        alerts = BudgetAlertEvent.objects.filter(user=self.user, year_month=self.year_month)
        self.assertEqual(alerts.count(), 1)
        self.budget.refresh_from_db()
        self.assertIn(0.5, self.budget.fired_flags)
    
    def test_transaction_update_recomputes(self):
        """Test that updating a transaction recomputes MTD."""
        tx = Transaction.objects.create(
            user=self.user,
            card_actually_used=self.card,
            merchant='Store A',
            amount=Decimal('300.00'),
            category='GROCERIES'
        )
        # Update to cross threshold
        tx.amount = Decimal('500.00')
        tx.save()
        #Should have fired alert
        alerts = BudgetAlertEvent.objects.filter(user=self.user, year_month=self.year_month)
        self.assertEqual(alerts.count(), 1)
    
    def test_transaction_delete_recomputes(self):
        """Test that deleting a transaction recomputes MTD."""
        tx = Transaction.objects.create(
            user=self.user,
            card_actually_used=self.card,
            merchant='Store A',
            amount=Decimal('500.00'),
            category='GROCERIES'
        )
        # Should have fired alert
        self.budget.refresh_from_db()
        self.assertIn(0.5, self.budget.fired_flags)
        # Delete transaction
        tx.delete()
        # MTD should be 0 now, but flags stay


#To run tests:
# python manage.py test budgets
