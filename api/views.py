
import uuid
from decimal import Decimal

from django.db import transaction
from django.db.models import Sum, Q
from django.utils import timezone

from rest_framework import viewsets, status
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated,AllowAny
from rest_framework.response import Response

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

from .serializers import (
    RoleSerializer,
    UserProfileSerializer,
    BeneficiarySerializer,
    RationCardSerializer,
    ItemSerializer,
    StockSerializer,
    AllocationSerializer,
    DistributionLogSerializer,
)


# --------------------------------------------------
# COMMON HELPERS
# --------------------------------------------------

def get_stock_balance(item):
    """Calculate current stock from IN and OUT transactions."""

    totals = Stock.objects.filter(item=item).aggregate(
        stock_in=Sum(
            "quantity",
            filter=Q(transaction_type="IN"),
        ),
        stock_out=Sum(
            "quantity",
            filter=Q(transaction_type="OUT"),
        ),
    )

    stock_in = totals["stock_in"] or Decimal("0")
    stock_out = totals["stock_out"] or Decimal("0")

    return stock_in - stock_out


def generate_receipt_number():
    """Generate a unique receipt number."""

    while True:
        receipt_no = f"RSM-{uuid.uuid4().hex[:12].upper()}"

        if not DistributionLog.objects.filter(
            receipt_no=receipt_no
        ).exists():
            return receipt_no


# --------------------------------------------------
# BASE VIEWSET
# --------------------------------------------------

class BaseModelViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]


# --------------------------------------------------
# 1. ROLES
# --------------------------------------------------

class RoleViewSet(BaseModelViewSet):
    queryset = Role.objects.all().order_by("role_id")
    serializer_class = RoleSerializer


# --------------------------------------------------
# 2. USER PROFILES
# --------------------------------------------------

class UserProfileViewSet(BaseModelViewSet):
    queryset = UserProfile.objects.select_related(
        "user", "role"
    ).all().order_by("id")

    serializer_class = UserProfileSerializer


# --------------------------------------------------
# 3. BENEFICIARIES
# --------------------------------------------------

class BeneficiaryViewSet(BaseModelViewSet):
    queryset = Beneficiary.objects.all().order_by(
        "beneficiary_id"
    )
    serializer_class = BeneficiarySerializer
    permission_classes = [AllowAny]

# --------------------------------------------------
# 4. RATION CARDS
# --------------------------------------------------

# 4. RATION CARDS

class RationCardViewSet(BaseModelViewSet):
    queryset = RationCard.objects.select_related(
        "beneficiary"
    ).all().order_by("ration_card_id")

    serializer_class = RationCardSerializer
    permission_classes = [AllowAny]

# --------------------------------------------------
# 5. ITEMS
# --------------------------------------------------

class ItemViewSet(BaseModelViewSet):
    queryset = Item.objects.all().order_by("item_id")
    serializer_class = ItemSerializer
    permission_classes = [AllowAny]

    serializer_class = ItemSerializer


# --------------------------------------------------
# 6. STOCK TRANSACTIONS
# --------------------------------------------------

class StockViewSet(BaseModelViewSet):
    queryset = Stock.objects.select_related(
        "item"
    ).all().order_by("-transaction_date")


    serializer_class = StockSerializer
    

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        item = serializer.validated_data["item"]
        quantity = serializer.validated_data["quantity"]
        transaction_type = serializer.validated_data[
            "transaction_type"
        ]

        with transaction.atomic():
            # Lock the item row to serialize stock changes
            Item.objects.select_for_update().get(pk=item.pk)

            current_balance = get_stock_balance(item)

            if transaction_type == "OUT":
                if quantity > current_balance:
                    raise ValidationError({
                        "quantity": (
                            f"Insufficient stock. "
                            f"Available: {current_balance}"
                        )
                    })

            stock = serializer.save()

        return Response(
            self.get_serializer(stock).data,
            status=status.HTTP_201_CREATED,
        )


# --------------------------------------------------
# 7. MONTHLY ALLOCATIONS
# --------------------------------------------------

class AllocationViewSet(BaseModelViewSet):
    queryset = Allocation.objects.select_related(
        "ration_card", "item"
    ).all().order_by(
        "-year", "-month", "allocation_id"
    )

    serializer_class = AllocationSerializer


# --------------------------------------------------
# 8. DISTRIBUTION LOGS
# --------------------------------------------------

class DistributionLogViewSet(BaseModelViewSet):
    queryset = DistributionLog.objects.select_related(
        "ration_card", "item"
    ).all().order_by("-distribution_date")

    serializer_class = DistributionLogSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        ration_card = serializer.validated_data["ration_card"]
        item = serializer.validated_data["item"]
        quantity = serializer.validated_data["quantity_issued"]

        now = timezone.localtime(timezone.now())
        current_month = now.month
        current_year = now.year

        with transaction.atomic():
            # Lock rows involved in the distribution
            Item.objects.select_for_update().get(pk=item.pk)

            RationCard.objects.select_for_update().get(
                pk=ration_card.pk
            )

            # Check active card and beneficiary
            if not ration_card.status:
                raise ValidationError({
                    "ration_card": "This ration card is inactive."
                })

            if not ration_card.beneficiary.status:
                raise ValidationError({
                    "ration_card": (
                        "The beneficiary associated with "
                        "this card is inactive."
                    )
                })

            # Find this month's allocation
            allocation = Allocation.objects.select_for_update().filter(
                ration_card=ration_card,
                item=item,
                month=current_month,
                year=current_year,
            ).first()

            if allocation is None:
                raise ValidationError({
                    "allocation": (
                        "No allocation exists for this item "
                        "and ration card for the current month."
                    )
                })

            # Calculate quantity already issued this month
            issued_total = DistributionLog.objects.filter(
                ration_card=ration_card,
                item=item,
                distribution_date__year=current_year,
                distribution_date__month=current_month,
            ).aggregate(
                total=Sum("quantity_issued")
            )["total"] or Decimal("0")

            remaining_allocation = (
                allocation.allocated_quantity - issued_total
            )

            if quantity > remaining_allocation:
                raise ValidationError({
                    "quantity_issued": (
                        "Quantity exceeds the remaining monthly "
                        f"allocation. Remaining: {remaining_allocation}"
                    )
                })

            # Check physical stock
            available_stock = get_stock_balance(item)

            if quantity > available_stock:
                raise ValidationError({
                    "quantity_issued": (
                        "Insufficient stock. "
                        f"Available: {available_stock}"
                    )
                })

            # Generate a receipt if the client did not provide one
            receipt_no = (
                serializer.validated_data.get("receipt_no") or ""
            ).strip()

            if not receipt_no:
                receipt_no = generate_receipt_number()

            if DistributionLog.objects.filter(
                receipt_no=receipt_no
            ).exists():
                raise ValidationError({
                    "receipt_no": "This receipt number already exists."
                })

            # Create distribution and matching stock-out transaction
            distribution = serializer.save(
                receipt_no=receipt_no
            )

            Stock.objects.create(
                item=item,
                quantity=quantity,
                transaction_type="OUT",
                remarks=f"Distribution receipt: {receipt_no}",
            )

        return Response(
            self.get_serializer(distribution).data,
            status=status.HTTP_201_CREATED,
        )
