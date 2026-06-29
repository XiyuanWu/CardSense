from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .history import append_chat_exchange, get_user_chat_history
from .services import generate_chat_reply


class ChatHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        messages = get_user_chat_history(request.user)
        return Response(
            {"success": True, "data": {"messages": messages}},
            status=status.HTTP_200_OK,
        )


class ChatView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        message = request.data.get("message", "")
        history = get_user_chat_history(request.user)
        result = generate_chat_reply(request.user, message, history)
        reply = result.get("reply", "")
        if message.strip() and reply.strip():
            append_chat_exchange(request.user, message, reply)
        return Response(
            {
                "success": True,
                "data": {
                    "reply": reply,
                    "hints": result.get("hints", []),
                    "error_code": result.get("error_code"),
                },
            },
            status=status.HTTP_200_OK,
        )
