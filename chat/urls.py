from django.urls import path

from .views import ChatHistoryView, ChatView

urlpatterns = [
    path("history/", ChatHistoryView.as_view(), name="chat-history"),
    path("", ChatView.as_view(), name="chat"),
]
