
import re

from django.contrib.auth.models import User
from rest_framework import serializers

from .models import (
    Role,
    UserProfile,
    Beneficiary,
    RationCard,
    Item,
    Stock,
    Allocation,
    DistributionLog,
)


# 1. ROLE SERIALIZER
class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = "__all__"


# 2. DJANGO USER SERIALIZER
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "is_active"]


# 3. USER PROFILE SERIALIZER
class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(
        source="user.username",
        read_only=True,
    )

    class Meta:
        model = UserProfile
        fields = "__all__"
        read_only_fields = ["user"]


# 4. BENEFICIARY SERIALIZER
class BeneficiarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Beneficiary
        fields = "__all__"

    def validate_aadhaar_no(self, value):
        if not re.fullmatch(r"[0-9]{12}", value):
            raise serializers.ValidationError(
                "Aadhaar number must contain exactly 12 digits."
            )
        return value

    def validate_mobile_no(self, value):
        if not re.fullmatch(r"[0-9]{10,15}", value):
            raise serializers.ValidationError(
                "Mobile number must contain 10 to 15 digits."
            )
        return value

    def validate_family_size(self, value):
        if value < 1:
            raise serializers.ValidationError(
                "Family size must be at least 1."
            )
        return value


# 5. RATION CARD SERIALIZER
class RationCardSerializer(serializers.ModelSerializer):
    class Meta:
        model = RationCard
        fields = "__all__"

    def validate_card_number(self, value):
        value = value.strip()

        queryset = RationCard.objects.filter(
            card_number=value
        )

        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)

        if queryset.exists():
            raise serializers.ValidationError(
                "This ration card number already exists."
            )

        return value


# 6. ITEM SERIALIZER
class ItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Item
        fields = "__all__"

    def validate_item_name(self, value):
        value = value.strip()

        queryset = Item.objects.filter(
            item_name__iexact=value
        )

        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)

        if queryset.exists():
            raise serializers.ValidationError(
                "An item with this name already exists."
            )

        return value


# 7. STOCK SERIALIZER
class StockSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stock
        fields = "__all__"
        read_only_fields = ["transaction_date"]

    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                "Quantity must be greater than zero."
            )
        return value


# 8. MONTHLY ALLOCATION SERIALIZER
class AllocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Allocation
        fields = "__all__"
        read_only_fields = ["created_at"]

    def validate(self, attrs):
        ration_card = attrs.get(
            "ration_card",
            getattr(self.instance, "ration_card", None),
        )
        item = attrs.get(
            "item",
            getattr(self.instance, "item", None),
        )
        month = attrs.get(
            "month",
            getattr(self.instance, "month", None),
        )
        year = attrs.get(
            "year",
            getattr(self.instance, "year", None),
        )

        if month is not None and not 1 <= month <= 12:
            raise serializers.ValidationError({
                "month": "Month must be between 1 and 12."
            })

        if year is not None and not 2000 <= year <= 9999:
            raise serializers.ValidationError({
                "year": "Year must be between 2000 and 9999."
            })

        if all(
            value is not None
            for value in [ration_card, item, month, year]
        ):
            queryset = Allocation.objects.filter(
                ration_card=ration_card,
                item=item,
                month=month,
                year=year,
            )

            if self.instance:
                queryset = queryset.exclude(
                    pk=self.instance.pk
                )

            if queryset.exists():
                raise serializers.ValidationError(
                    "An allocation for this ration card, "
                    "item and month already exists."
                )

        return attrs


# 9. DISTRIBUTION LOG SERIALIZER
class DistributionLogSerializer(serializers.ModelSerializer):
    receipt_no = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=50,
    )

    class Meta:
        model = DistributionLog
        fields = "__all__"
        read_only_fields = ["distribution_date"]

    def validate_quantity_issued(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                "Issued quantity must be greater than zero."
            )
        return value

    def validate_receipt_no(self, value):
        value = value.strip()

        if not value:
            return value

        queryset = DistributionLog.objects.filter(
            receipt_no=value
        )

        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)

        if queryset.exists():
            raise serializers.ValidationError(
                "This receipt number already exists."
            )

        return value