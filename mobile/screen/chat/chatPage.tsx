import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useRef, useEffect } from "react";
import { sendChatMessage, fetchChatHistory, type ChatMessage } from "@/utils/api/chat";
import {
  CHAT_WELCOME_MESSAGE,
  loadChatHistory,
  saveChatHistory,
} from "@/utils/chatHistoryStorage";
import { ChatMessageText } from "@/components/chat/ChatMessageText";

const SUGGESTIONS = [
  "Which card is best for gas?",
  "What card for groceries?",
  "Maximize dining rewards?",
];

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(() => loadChatHistory());
  const [historyReady, setHistoryReady] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const prevMessageCount = useRef(0);

  useEffect(() => {
    let cancelled = false;

    const syncHistory = async () => {
      const response = await fetchChatHistory();
      if (cancelled) return;

      if (response.success && response.data) {
        const remote = response.data.messages.filter(
          (m) =>
            (m.role === "user" || m.role === "assistant") &&
            m.content.trim().length > 0,
        );
        setMessages(remote.length > 0 ? remote : [CHAT_WELCOME_MESSAGE]);
      }
      setHistoryReady(true);
    };

    syncHistory();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!historyReady) return;
    saveChatHistory(messages);
  }, [messages, historyReady]);

  useEffect(() => {
    if (!historyReady || loading) return;
    if (messages.length <= prevMessageCount.current) return;
    prevMessageCount.current = messages.length;
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    });
  }, [messages, loading, historyReady]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMessage: ChatMessage = { role: "user", content: trimmed };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setError(null);
    setLoading(true);

    const response = await sendChatMessage(trimmed);

    if (response.success && response.data) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response.data.reply },
      ]);
    } else if (!response.success) {
      setError(response.error.message || "Could not get a reply.");
    } else {
      setError("Could not get a reply.");
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerSpacer} />
          <Text style={styles.title}>Assistant</Text>
          <View style={styles.headerSpacer} />
        </View>

        <KeyboardAvoidingView
          style={styles.chatBody}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        >
          <ScrollView
            ref={scrollRef}
            style={styles.messages}
            contentContainerStyle={styles.messagesContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator
          >
            {messages.map((msg, index) => (
              <View
                key={index}
                style={[
                  styles.bubbleRow,
                  msg.role === "user" ? styles.bubbleRowUser : styles.bubbleRowBot,
                ]}
              >
                <View
                  style={[
                    styles.bubble,
                    msg.role === "user" ? styles.bubbleUser : styles.bubbleBot,
                  ]}
                >
                  {msg.role === "assistant" ? (
                    <View>
                      {msg.content.split("\n").map((line, lineIndex) => {
                        const trimmed = line.trim();
                        if (!trimmed) {
                          return <View key={lineIndex} style={styles.lineSpacer} />;
                        }
                        return (
                          <ChatMessageText
                            key={lineIndex}
                            text={trimmed}
                            style={styles.bubbleText}
                            boldStyle={styles.bubbleTextBold}
                          />
                        );
                      })}
                    </View>
                  ) : (
                    <Text style={[styles.bubbleText, styles.bubbleTextUser]}>
                      {msg.content}
                    </Text>
                  )}
                </View>
              </View>
            ))}
            {loading && (
              <View style={styles.loadingRow}>
                <ActivityIndicator color="#5E17EB" size="small" />
                <Text style={styles.loadingText}>Thinking…</Text>
              </View>
            )}
          </ScrollView>

          <View style={styles.footer}>
            {error ? <Text style={styles.error}>{error}</Text> : null}

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.suggestions}
              contentContainerStyle={styles.suggestionsContent}
            >
              {SUGGESTIONS.map((s) => (
                <Pressable
                  key={s}
                  style={styles.chip}
                  onPress={() => sendMessage(s)}
                  disabled={loading}
                >
                  <Text style={styles.chipText}>{s}</Text>
                </Pressable>
              ))}
            </ScrollView>

            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                value={input}
                onChangeText={setInput}
                placeholder="Ask about your cards…"
                placeholderTextColor="#9CA3AF"
                editable={!loading}
                onSubmitEditing={() => sendMessage(input)}
                returnKeyType="send"
                multiline={false}
              />
              <Pressable
                style={[
                  styles.sendBtn,
                  (!input.trim() || loading) && styles.sendBtnDisabled,
                ]}
                onPress={() => sendMessage(input)}
                disabled={!input.trim() || loading}
              >
                <Text style={styles.sendBtnText}>Send</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    flex: 1,
    paddingHorizontal: 35,
    paddingTop: 20,
    paddingBottom: 80,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  headerSpacer: {
    width: 40,
    height: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#222222",
    textAlign: "center",
    flex: 1,
  },
  chatBody: {
    flex: 1,
  },
  messages: {
    flex: 1,
  },
  messagesContent: {
    paddingBottom: 12,
  },
  bubbleRow: {
    flexDirection: "row",
    marginBottom: 10,
  },
  bubbleRowUser: {
    justifyContent: "flex-end",
  },
  bubbleRowBot: {
    justifyContent: "flex-start",
  },
  bubble: {
    maxWidth: "88%",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleUser: {
    backgroundColor: "#5E17EB",
  },
  bubbleBot: {
    backgroundColor: "#F3F4F6",
  },
  bubbleText: {
    fontSize: 15,
    color: "#222222",
    lineHeight: 22,
  },
  bubbleTextUser: {
    color: "#FFFFFF",
  },
  bubbleTextBold: {
    fontWeight: "700",
  },
  lineSpacer: {
    height: 6,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
  },
  loadingText: {
    fontSize: 13,
    color: "#6B7280",
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: "#E6EAEF",
    backgroundColor: "#FFFFFF",
    paddingTop: 8,
    paddingBottom: 4,
  },
  error: {
    color: "#FF3B30",
    fontSize: 13,
    marginBottom: 6,
  },
  suggestions: {
    maxHeight: 40,
    marginBottom: 8,
  },
  suggestionsContent: {
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderColor: "#E6EAEF",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipText: {
    fontSize: 12,
    color: "#374151",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E6EAEF",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#222222",
    backgroundColor: "#FAFAFA",
    maxHeight: 100,
  },
  sendBtn: {
    backgroundColor: "#5E17EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
  sendBtnText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
});
