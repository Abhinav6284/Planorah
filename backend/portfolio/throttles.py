from rest_framework.throttling import UserRateThrottle


class PortfolioEventThrottle(UserRateThrottle):
    scope = 'portfolio_event'
