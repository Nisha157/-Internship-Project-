
from rest_framework.routers import DefaultRouter

from .views import (
    RoleViewSet,
    UserProfileViewSet,
    BeneficiaryViewSet,
    RationCardViewSet,
    ItemViewSet,
    StockViewSet,
    AllocationViewSet,
    DistributionLogViewSet,
)

router = DefaultRouter()

router.register("roles", RoleViewSet, basename="role")
router.register("user-profiles", UserProfileViewSet, basename="user-profile")
router.register("beneficiaries", BeneficiaryViewSet, basename="beneficiary")
router.register("ration-cards", RationCardViewSet, basename="ration-card")
router.register("items", ItemViewSet, basename="item")
router.register("stock", StockViewSet, basename="stock")
router.register("allocations", AllocationViewSet, basename="allocation")
router.register("distributions", DistributionLogViewSet, basename="distribution")

urlpatterns = router.urls