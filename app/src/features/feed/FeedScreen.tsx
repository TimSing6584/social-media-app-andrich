import React, { useMemo } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  View,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFeedData } from "./useFeedData";
import { Post } from "../../types/post";

const ITEM_HEIGHT = 140;
const { height } = Dimensions.get('window');
const FeedItem = ({ item }: { item: Post }) => {
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
        <Text style={styles.description} numberOfLines={3}>
          {item.description}
        </Text>
      ) : null}
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.image} resizeMode="contain"/>
      ) : null}
    </View>
  );
};

export const FeedScreen: React.FC = () => {
  const { bottom, top } = useSafeAreaInsets();
  const { posts, loading } = useFeedData();

  const contentInset = useMemo(
    () => ({ paddingTop: 12 + top, paddingBottom: 12 + bottom }),
    [bottom, top]
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        renderItem={({ item }) => <FeedItem item={item} />}
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
});
