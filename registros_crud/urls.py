from django.urls import path
from .views import registros_crud
urlpatterns = [path("", registros_crud, name="registros_crud")]