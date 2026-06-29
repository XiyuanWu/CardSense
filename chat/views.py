from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .services import generate_chat_reply


class ChatView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        message = request.data.get("message", "")
        history = request.data.get("history", [])
        result = generate_chat_reply(request.user, message, history)
        return Response(
            {
                "success": True,
                "data": {
                    "reply": result["reply"],
                    "hints": result.get("hints", []),
                    "error_code": result.get("error_code"),
                },
            },
            status=status.HTTP_200_OK,
        )
