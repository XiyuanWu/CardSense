from django.apps import AppConfig


class BudgetsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'budgets'
    
    def ready(self):
        """Import signals when app is ready to avoid circular imports."""
        import budgets.signals