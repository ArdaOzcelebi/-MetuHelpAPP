import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { getFirestoreInstance } from "@/src/firebase/firebaseConfig";
import type { BrowseStackParamList } from "@/navigation/BrowseStackNavigator";

type ForumScreenProps = {
  navigation: NativeStackNavigationProp<BrowseStackParamList, "Browse">;
};

interface ForumPost {
  id: string;
  title: string;
  body: string;
  authorName: string;
  authorId: string;
  createdAt: Date;
  replyCount: number;
}

export default function ForumScreen({ navigation }: ForumScreenProps) {
  const { theme } = useTheme();
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const db = getFirestoreInstance();
    const postsRef = collection(db, "forum_posts");
    const q = query(postsRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const postsData: ForumPost[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          postsData.push({
            id: doc.id,
            title: data.title || "",
            body: data.body || "",
            authorName: data.authorName || "Anonymous",
            authorId: data.authorId || "",
            createdAt: data.createdAt?.toDate() || new Date(),
            replyCount: data.replyCount || 0,
          });
        });
        setPosts(postsData);
        setLoading(false);
        setRefreshing(false);
      },
      (error) => {
        console.error("Error fetching posts:", error);
        setLoading(false);
        setRefreshing(false);
      },
    );

    return () => unsubscribe();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
  };

  const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return `${diffInDays} days ago`;
  };

  const renderPost = ({ item }: { item: ForumPost }) => (
    <Pressable
      onPress={() =>
        navigation.navigate("QuestionDetail", { questionId: item.id })
      }
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: "#FFFFFF" },
        pressed && styles.cardPressed,
      ]}
    >
      <ThemedText style={styles.cardTitle}>{item.title}</ThemedText>
      {item.body ? (
        <ThemedText style={styles.cardPreview} numberOfLines={2}>
          {item.body}
        </ThemedText>
      ) : null}
      <View style={styles.cardMeta}>
        <ThemedText style={styles.metaText}>
          {getTimeAgo(item.createdAt)} • {item.replyCount} replies
        </ThemedText>
      </View>
    </Pressable>
  );

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Feather name="message-circle" size={64} color="#CCCCCC" />
      <ThemedText style={styles.emptyTitle}>No questions yet</ThemedText>
      <ThemedText style={styles.emptySubtitle}>
        Be the first to ask!
      </ThemedText>
    </View>
  );

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#800000" />
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          posts.length === 0 && styles.listContentEmpty,
        ]}
        ListEmptyComponent={EmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#800000"
          />
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Action Button */}
      <Pressable
        onPress={() => navigation.navigate("AskQuestion")}
        style={({ pressed }) => [
          styles.fab,
          pressed && styles.fabPressed,
        ]}
      >
        <Feather name="plus" size={28} color="#FFFFFF" />
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  listContentEmpty: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardPressed: {
    opacity: 0.7,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  cardPreview: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 12,
    lineHeight: 20,
  },
  cardMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaText: {
    fontSize: 12,
    color: "#999999",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666666",
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#999999",
    marginTop: 8,
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#800000",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.95 }],
  },
});
