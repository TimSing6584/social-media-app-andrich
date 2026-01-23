import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  View,
  Dimensions,
  Modal,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFeedData } from "./useFeedData";
import { Post } from "../../types/post";

const ITEM_HEIGHT = 140;
const { height, width } = Dimensions.get('window');
const DESCRIPTION_THRESHOLD = 100; // Character limit before showing "More"

const FeedItem = ({ item, onImagePress }: { item: Post; onImagePress?: (imageUri: string) => void }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const descriptionLength = item.description?.length || 0;
  const needsExpansion = descriptionLength > DESCRIPTION_THRESHOLD;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.author} numberOfLines={1}>
          {item.author}
        </Text>
      </View>
      {item.description ? (
        <View>
          <Text style={styles.description} numberOfLines={isExpanded ? undefined : 3}>
            {item.description}
          </Text>
          {needsExpansion && (
            <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)}>
              <Text style={styles.moreText}>
                {isExpanded ? "Show Less" : "... More"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      ) : null}
      {item.image ? (
        <TouchableOpacity onPress={() => onImagePress?.(item.image!)} activeOpacity={1}>
          <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover"/>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

export const FeedScreen: React.FC = () => {
  const { bottom, top } = useSafeAreaInsets();
  const { posts, loading, refresh } = useFeedData();
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);

  // Refresh feed when this tab is focused (e.g., after creating a post)
  useFocusEffect(
    React.useCallback(() => {
      refresh();
    }, [refresh])
  );

  const contentInset = useMemo(
    () => ({ paddingTop: 12 + top, paddingBottom: 12 + bottom }),
    [bottom, top]
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        renderItem={({ item }) => <FeedItem item={item} onImagePress={setSelectedImageUri} />}
        keyExtractor={(_, index) => `post-${index}`}
        contentContainerStyle={contentInset}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        initialNumToRender={20}
        maxToRenderPerBatch={25}
        windowSize={10}
        getItemLayout={(_, index) => ({
          length: ITEM_HEIGHT,
          offset: ITEM_HEIGHT * index,
          index,
        })}
        ListFooterComponent={
          loading ? (
            <View style={styles.footer}>
              <ActivityIndicator />
            </View>
          ) : null
        }
      />

      {/* Image Modal */}
      <Modal
        visible={selectedImageUri !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedImageUri(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedImageUri && (
              <Image
                source={{ uri: selectedImageUri }}
                style={styles.fullscreenImage}
                resizeMode="contain"
              />
            )}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedImageUri(null)}
            >
              <Ionicons name="close" size={30} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f7f7",
  },
  card: {
    backgroundColor: "#fff",
    padding: 12,
    marginHorizontal: 12,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    minHeight: ITEM_HEIGHT - 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
    gap: 8,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
  },
  author: {
    fontSize: 13,
    color: "#555",
  },
  description: {
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
  },
  moreText: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "600",
    marginBottom: 8,
  },
  image: {
    height: height * 0.3,
    borderRadius: 8,
    backgroundColor: "#ececec",
    marginTop: 4,
  },
  separator: {
    height: 10,
  },
  footer: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: width,
    height: height,
    justifyContent: "center",
    alignItems: "center",
  },
  fullscreenImage: {
    width: "100%",
    height: "100%",
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
});
