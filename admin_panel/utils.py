from functools import wraps
from django.shortcuts import redirect

def admin_required(view_func):
    @wraps(view_func)
    def _wrapped(request, *args, **kwargs):
        if not request.session.get("admin_id"):
            return redirect("inicio_sesion")
        return view_func(request, *args, **kwargs)
    return _wrapped
