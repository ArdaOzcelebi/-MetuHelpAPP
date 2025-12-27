import React, { useState } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useAuth } from "@/src/contexts/AuthContext";
import { getFirestoreInstance } from "@/src/firebase/firebaseConfig";
import type { BrowseStackParamList } from "@/navigation/BrowseStackNavigator";

type PostQuestionScreenProps = {
  navigation: NativeStackNavigationProp<BrowseStackParamList, "AskQuestion">;
};

export default function PostQuestionScreen({
  navigation,
}: PostQuestionScreenProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  const canPost = title.trim().length >= 10;

  const handleCancel = () => {
    navigation.goBack();
  };

  const handleCreatePost = async () => {
    if (!canPost || isPosting) return;

    if (!user) {
      Alert.alert("Error", "You must be logged in to post a question");
      return;
    }

    setIsPosting(true);

    try {
      const db = getFirestoreInstance();
      const postsRef = collection(db, "forum_posts");

      await addDoc(postsRef, {
        title: title.trim(),
        body: body.trim(),
        authorName: user.displayName || "Anonymous",
        authorId: user.uid,
        createdAt: serverTimestamp(),
        replyCount: 0,
      });

      Alert.alert("Success", "Question posted!");
      navigation.goBack();
    } catch (error) {
      console.error("Error posting question:", error);
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to post question",
      );
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={handleCancel}
            style={styles.headerButton}
            disabled={isPosting}
          >
            <ThemedText style={styles.cancelText}>Cancel</ThemedText>
          </Pressable>
          <Pressable
            onPress={handleCreatePost}
            disabled={!canPost || isPosting}
            style={[
              styles.headerButton,
              styles.postButton,
              (!canPost || isPosting) && styles.postButtonDisabled,
            ]}
          >
            {isPosting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <ThemedText
                style={[
                  styles.postText,
                  (!canPost || isPosting) && styles.postTextDisabled,
                ]}
              >
                Post
              </ThemedText>
            )}
          </Pressable>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <TextInput
            style={styles.titleInput}
            placeholder="What's your question?"
            placeholderTextColor="#999999"
            value={title}
            onChangeText={setTitle}
            autoFocus
            editable={!isPosting}
          />
          <TextInput
            style={styles.bodyInput}
            placeholder="Add details (optional)..."
            placeholderTextColor="#999999"
            value={body}
            onChangeText={setBody}
            multiline
            textAlignVertical="top"
            editable={!isPosting}
          />
          <ThemedText style={styles.hint}>
            {title.length >= 10
              ? `✓ Good title (${title.length} characters)`
              : `Minimum 10 characters (${title.length}/10)`}
          </ThemedText>
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  headerButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  postButton: {
    backgroundColor: "#800000",
    borderRadius: 8,
    minWidth: 70,
    alignItems: "center",
  },
  postButtonDisabled: {
    backgroundColor: "#CCCCCC",
  },
  cancelText: {
    fontSize: 16,
    color: "#800000",
  },
  postText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  postTextDisabled: {
    color: "#999999",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  titleInput: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 16,
    paddingVertical: 8,
  },
  bodyInput: {
    flex: 1,
    fontSize: 16,
    color: "#1A1A1A",
    paddingVertical: 8,
  },
  hint: {
    fontSize: 12,
    color: "#999999",
    marginTop: 8,
  },
});
