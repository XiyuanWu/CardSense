# AI generated script
from django.core.management.base import BaseCommand
from cards.models import Card, RewardRule

class Command(BaseCommand):
    help = 'Add default 1x OTHER category reward rule to all cards that don\'t have one'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be created without actually creating records',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        
        # Get all cards
        cards = Card.objects.all()
        created_count = 0
        skipped_count = 0
        
        self.stdout.write(f"Processing {cards.count()} cards...")
        
        for card in cards:
            # Check if this card already has an OTHER category reward rule
            existing_other_rule = RewardRule.objects.filter(
                card=card,
                category__contains='OTHER'
            ).exists()
            
            if existing_other_rule:
                self.stdout.write(
                    self.style.WARNING(f"Card '{card}' already has OTHER category rule - skipping")
                )
                skipped_count += 1
                continue
            
            if dry_run:
                self.stdout.write(
                    self.style.SUCCESS(f"[DRY RUN] Would create 1x OTHER rule for card: {card}")
                )
                created_count += 1
            else:
                # Create the default 1x OTHER reward rule
                RewardRule.objects.create(
                    card=card,
                    multiplier=1.0,
                    category=['OTHER'],
                    notes="Default 1% on all other purchases"
                )
                self.stdout.write(
                    self.style.SUCCESS(f"Created 1x OTHER rule for card: {card}")
                )
                created_count += 1
        
        if dry_run:
            self.stdout.write(
                self.style.WARNING(f"\n[DRY RUN] Would create {created_count} reward rules, skip {skipped_count}")
            )
        else:
            self.stdout.write(
                self.style.SUCCESS(f"\nCompleted! Created {created_count} reward rules, skipped {skipped_count}")
            )
