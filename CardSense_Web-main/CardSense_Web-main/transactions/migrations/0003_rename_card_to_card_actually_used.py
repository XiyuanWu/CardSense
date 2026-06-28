# Generated migration for renaming card field to preserve data

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('cards', '0001_initial'),
        ('transactions', '0002_transaction_recommended_card_alter_transaction_card'),
    ]

    operations = [
        migrations.RenameField(
            model_name='transaction',
            old_name='card',
            new_name='card_actually_used',
        ),
        migrations.AlterField(
            model_name='transaction',
            name='card_actually_used',
            field=models.ForeignKey(
                blank=True,
                help_text='The card that was actually used for this transaction (optional)',
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='used_transactions',
                to='cards.card',
                verbose_name='Card Actually Used'
            ),
        ),
        migrations.AlterField(
            model_name='transaction',
            name='recommended_card',
            field=models.ForeignKey(
                blank=True,
                help_text='The optimal card recommended by the system',
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='recommended_transactions',
                to='cards.card',
                verbose_name='Recommended Card'
            ),
        ),
    ]

