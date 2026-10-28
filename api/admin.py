from django.contrib import admin

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


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ("role_id", "role_name", "status", "created_at")
    search_fields = ("role_name",)
    list_filter = ("status",)


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ("id", "full_name", "user", "role", "phone", "status")
    search_fields = ("full_name", "phone", "user__username")
    list_filter = ("role", "status")


@admin.register(Beneficiary)
class BeneficiaryAdmin(admin.ModelAdmin):
    list_display = (
        "beneficiary_id",
        "full_name",
        "aadhaar_no",
        "mobile_no",
        "family_size",
        "status",
    )
    search_fields = ("full_name", "aadhaar_no", "mobile_no")
    list_filter = ("status",)


@admin.register(RationCard)
class RationCardAdmin(admin.ModelAdmin):
    list_display = (
        "ration_card_id",
        "card_number",
        "beneficiary",
        "card_type",
        "issue_date",
        "status",
    )
    search_fields = ("card_number", "beneficiary__full_name")
    list_filter = ("card_type", "status")


@admin.register(Item)
class ItemAdmin(admin.ModelAdmin):
    list_display = (
        "item_id",
        "item_name",
        "unit",
        "status",
        "created_at",
    )
    search_fields = ("item_name",)
    list_filter = ("status",)


@admin.register(Stock)
class StockAdmin(admin.ModelAdmin):
    list_display = (
        "stock_id",
        "item",
        "quantity",
        "transaction_type",
        "transaction_date",
    )
    search_fields = ("item__item_name",)
    list_filter = ("transaction_type",)


@admin.register(Allocation)
class AllocationAdmin(admin.ModelAdmin):
    list_display = (
        "allocation_id",
        "ration_card",
        "item",
        "month",
        "year",
        "allocated_quantity",
        "created_at",
    )
    search_fields = (
        "ration_card__card_number",
        "item__item_name",
    )
    list_filter = ("month", "year")


@admin.register(DistributionLog)
class DistributionLogAdmin(admin.ModelAdmin):
    list_display = (
        "distribution_id",
        "ration_card",
        "item",
        "quantity_issued",
        "distribution_date",
        "receipt_no",
        "verification_method",
    )
    search_fields = (
        "ration_card__card_number",
        "receipt_no",
        "item__item_name",
    )
    list_filter = ("verification_method",)