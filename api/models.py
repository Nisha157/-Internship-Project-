
from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db.models import Q


# 1. ROLES
class Role(models.Model):
    role_id = models.AutoField(primary_key=True)
    role_name = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)
    status = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.role_name


# 2. USERS - Django User + UserProfile
class UserProfile(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.PROTECT,
        related_name="profile"
    )
    role = models.ForeignKey(
        Role,
        on_delete=models.PROTECT,
        related_name="users"
    )
    full_name = models.CharField(max_length=100)
    phone = models.CharField(max_length=15, blank=True)
    status = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.full_name


# 3. BENEFICIARIES
class Beneficiary(models.Model):
    beneficiary_id = models.AutoField(primary_key=True)
    full_name = models.CharField(max_length=100)
    aadhaar_no = models.CharField(max_length=12, unique=True)
    mobile_no = models.CharField(max_length=15)
    address = models.TextField()
    family_size = models.PositiveIntegerField(
        default=1,
        validators=[MinValueValidator(1)]
    )
    status = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.full_name


# 4. RATION CARDS
class RationCard(models.Model):
    CARD_TYPES = [
        ("APL", "APL"),
        ("BPL", "BPL"),
        ("AAY", "AAY"),
    ]

    ration_card_id = models.AutoField(primary_key=True)
    card_number = models.CharField(max_length=30, unique=True)
    beneficiary = models.OneToOneField(
        Beneficiary,
        on_delete=models.PROTECT,
        related_name="ration_card"
    )
    card_type = models.CharField(max_length=10, choices=CARD_TYPES)
    issue_date = models.DateField()
    status = models.BooleanField(default=True)

    def __str__(self):
        return self.card_number


# 5. ITEMS
class Item(models.Model):
    item_id = models.AutoField(primary_key=True)
    item_name = models.CharField(max_length=100, unique=True)
    unit = models.CharField(max_length=20)
    description = models.TextField(blank=True)
    status = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.item_name


# 6. STOCK TRANSACTIONS
class Stock(models.Model):
    TRANSACTION_TYPES = [
        ("IN", "Stock In"),
        ("OUT", "Stock Out"),
    ]

    stock_id = models.AutoField(primary_key=True)
    item = models.ForeignKey(
        Item,
        on_delete=models.PROTECT,
        related_name="stock_transactions"
    )
    quantity = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(0.01)]
    )
    transaction_type = models.CharField(
        max_length=3,
        choices=TRANSACTION_TYPES
    )
    transaction_date = models.DateTimeField(auto_now_add=True)
    remarks = models.TextField(blank=True)

    def __str__(self):
        return f"{self.item.item_name} - {self.quantity} ({self.transaction_type})"


# 7. MONTHLY ALLOCATIONS
class Allocation(models.Model):
    allocation_id = models.AutoField(primary_key=True)
    ration_card = models.ForeignKey(
        RationCard,
        on_delete=models.PROTECT,
        related_name="allocations"
    )
    item = models.ForeignKey(
        Item,
        on_delete=models.PROTECT,
        related_name="allocations"
    )
    month = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(12)]
    )
    year = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(2000), MaxValueValidator(9999)]
    )
    allocated_quantity = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0.01)]
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["ration_card", "item", "month", "year"],
                name="unique_monthly_card_item_allocation"
            )
        ]

    def __str__(self):
        return (
            f"{self.ration_card.card_number} - "
            f"{self.item.item_name} - {self.month}/{self.year}"
        )


# 8. DISTRIBUTION LOGS
class DistributionLog(models.Model):
    VERIFICATION_METHODS = [
        ("MANUAL", "Manual"),
        ("QR", "QR"),
        ("OTP", "OTP"),
    ]

    distribution_id = models.AutoField(primary_key=True)
    ration_card = models.ForeignKey(
        RationCard,
        on_delete=models.PROTECT,
        related_name="distributions"
    )
    item = models.ForeignKey(
        Item,
        on_delete=models.PROTECT,
        related_name="distributions"
    )
    quantity_issued = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0.01)]
    )
    distribution_date = models.DateTimeField(auto_now_add=True)
    receipt_no = models.CharField(max_length=50, unique=True)
    verification_method = models.CharField(
        max_length=10,
        choices=VERIFICATION_METHODS,
        default="MANUAL"
    )
    remarks = models.TextField(blank=True)

    def __str__(self):
        return self.receipt_no