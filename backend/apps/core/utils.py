from typing import Optional


def get_client_ip(request) -> Optional[str]:
    """Return the client's IP address taking X-Forwarded-For into account.

    Priority:
    - X-Forwarded-For (first IP)
    - X-Real-IP
    - REMOTE_ADDR
    """
    xff = request.META.get('HTTP_X_FORWARDED_FOR') or request.META.get('X_FORWARDED_FOR')
    if xff:
        # X-Forwarded-For can be a comma-separated list. First is client's IP.
        parts = [p.strip() for p in xff.split(',') if p.strip()]
        if parts:
            return parts[0]
    xri = request.META.get('HTTP_X_REAL_IP') or request.META.get('X_REAL_IP')
    if xri:
        return xri
    return request.META.get('REMOTE_ADDR')
