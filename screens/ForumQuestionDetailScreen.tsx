import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  increment,
  updateDoc,
} from "firebase/firestore";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/src/contexts/AuthContext";
import { getFirestoreInstance } from "@/src/firebase/firebaseConfig";
import type { BrowseStackParamList } from "@/navigation/BrowseStackNavigator";

type ForumQuestionDetailScreenProps = {
  navigation: NativeStackNavigationProp<BrowseStackParamList, "QuestionDetail">;
  route: RouteProp<BrowseStackParamList, "QuestionDetail">;
};

interface Reply {
  id: string;
  body: string;
  authorName: string;
  authorId: string;
  createdAt: Date;
}

export default function ForumQuestionDetailScreen({
  route,
  navigation,
}: ForumQuestionDetailScreenProps) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { questionId } = route.params;

  const [question, setQuestion] = useState<any>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  // Load question
  useEffect(() => {
    const loadQuestion = async () => {
      try {
        const db = getFirestoreInstance();
        const questionRef = doc(db, "forum_posts", questionId);
        const questionSnap = await getDoc(questionRef);

        if (!questionSnap.exists()) {
          Alert.alert("Error", "Question not found");
          navigation.goBack();
          return;
        }

        const data = questionSnap.data();
        setQuestion({
          id: questionSnap.id,
          title: data.title || "",
          body: data.body || "",
          authorName: data.authorName || "Anonymous",
          authorId: data.authorId || "",
          createdAt: data.createdAt?.toDate() || new Date(),
        });

        setLoading(false);
      } catch (error) {
        console.error("Failed to load question:", error);
        Alert.alert("Error", "Failed to load question");
        navigation.goBack();
      }
    };

    loadQuestion();
  }, [questionId, navigation]);

  // Subscribe to replies
  useEffect(() => {
    if (!questionId) return;

    const db = getFirestoreInstance();
    const repliesRef = collection(db, "forum_posts", questionId, "replies");
    const q = query(repliesRef, orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const repliesData: Reply[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        repliesData.push({
          id: doc.id,
          body: data.body || "",
          authorName: data.authorName || "Anonymous",
          authorId: data.authorId || "",
          createdAt: data.createdAt?.toDate() || new Date(),
        });
      });
      setReplies(repliesData);
    });

    return () => unsubscribe();
  }, [questionId]);

  const handlePostReply = async () => {
    if (!replyText.trim() || isPosting) return;

    if (!user) {
      Alert.alert("Error", "You must be logged in to reply");
      return;
    }

    setIsPosting(true);

    try {
      const db = getFirestoreInstance();
      const repliesRef = collection(db, "forum_posts", questionId, "replies");

      await addDoc(repliesRef, {
        body: replyText.trim(),
        authorName: user.displayName || "Anonymous",
        authorId: user.uid,
        createdAt: serverTimestamp(),
      });

      // Update reply count
      const questionRef = doc(db, "forum_posts", questionId);
      await updateDoc(questionRef, {
        replyCount: increment(1),
      });

      setReplyText("");
      Alert.alert("Success", "Reply posted!");
    } catch (error) {
      console.error("Error posting reply:", error);
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to post reply",
      );
    } finally {
      setIsPosting(false);
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#800000" />
        </View>
      </ThemedView>
    );
  }

  if (!question) return null;

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
        keyboardVerticalOffset={90}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Question Card */}
          <View style={styles.questionCard}>
            <View style={styles.questionHeader}>
              <View style={styles.avatar}>
                <ThemedText style={styles.avatarText}>
                  {question.authorName.substring(0, 1).toUpperCase()}
                </ThemedText>
              </View>
              <View style={styles.authorInfo}>
                <ThemedText style={styles.authorName}>
                  {question.authorName}
                </ThemedText>
                <ThemedText style={styles.timeText}>
                  {question.createdAt.toLocaleDateString()}
                </ThemedText>
              </View>
            </View>

            <ThemedText style={styles.questionTitle}>
              {question.title}
            </ThemedText>

            {question.body ? (
              <ThemedText style={styles.questionBody}>
                {question.body}
              </ThemedText>
            ) : null}
          </View>

          {/* Replies Section */}
          <View style={styles.repliesSection}>
            <ThemedText style={styles.repliesHeader}>
              {replies.length} {replies.length === 1 ? "Reply" : "Replies"}
            </ThemedText>

            {replies.length === 0 ? (
              <View style={styles.noReplies}>
                <Feather name="message-circle" size={48} color="#CCCCCC" />
                <ThemedText style={styles.noRepliesText}>
                  No replies yet. Be the first to help!
                </ThemedText>
              </View>
            ) : (
              replies.map((reply) => (
                <View key={reply.id} style={styles.replyCard}>
                  <View style={styles.replyHeader}>
                    <View style={styles.avatarSmall}>
                      <ThemedText style={styles.avatarTextSmall}>
                        {reply.authorName.substring(0, 1).toUpperCase()}
                      </ThemedText>
                    </View>
                    <View style={styles.replyAuthorInfo}>
                      <ThemedText style={styles.replyAuthorName}>
                        {reply.authorName}
                      </ThemedText>
                      <ThemedText style={styles.timeText}>
                        {reply.createdAt.toLocaleDateString()}
                      </ThemedText>
                    </View>
                  </View>
                  <ThemedText style={styles.replyBody}>{reply.body}</ThemedText>
                </View>
              ))
            )}
          </View>
        </ScrollView>

        {/* Reply Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.replyInput}
            placeholder="Write your reply..."
            placeholderTextColor="#999999"
            value={replyText}
            onChangeText={setReplyText}
            multiline
            editable={!isPosting}
          />
          <Pressable
            onPress={handlePostReply}
            disabled={!replyText.trim() || isPosting}
            style={({ pressed }) => [
              styles.sendButton,
              (!replyText.trim() || isPosting) && styles.sendButtonDisabled,
              pressed && styles.sendButtonPressed,
            ]}
          >
            {isPosting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Feather
                name="send"
                size={20}
                color={replyText.trim() ? "#FFFFFF" : "#999999"}
              />
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  questionCard: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  questionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#800000",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  timeText: {
    fontSize: 12,
    color: "#999999",
  },
  questionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 12,
  },
  questionBody: {
    fontSize: 16,
    color: "#666666",
    lineHeight: 24,
  },
  repliesSection: {
    marginTop: 8,
  },
  repliesHeader: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 12,
  },
  noReplies: {
    alignItems: "center",
    paddingVertical: 40,
  },
  noRepliesText: {
    fontSize: 14,
    color: "#999999",
    marginTop: 12,
  },
  replyCard: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  replyHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  avatarSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#800000",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  avatarTextSmall: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  replyAuthorInfo: {
    flex: 1,
  },
  replyAuthorName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  replyBody: {
    fontSize: 16,
    color: "#666666",
    lineHeight: 22,
  },
  inputContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
    gap: 8,
    alignItems: "flex-end",
  },
  replyInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    backgroundColor: "#F5F5F5",
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1A1A1A",
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#800000",
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#CCCCCC",
  },
  sendButtonPressed: {
    opacity: 0.8,
  },
});
