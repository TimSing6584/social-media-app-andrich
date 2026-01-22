import AsyncStorage from "@react-native-async-storage/async-storage";
import { Post } from "../types/post";

const USER_POSTS_KEY = "@social_media_app:user_posts";

/**
 * Get all user-created posts from AsyncStorage
 */
export const getUserPosts = async (): Promise<Post[]> => {
  try {
    const data = await AsyncStorage.getItem(USER_POSTS_KEY);
    if (!data) return [];
    return JSON.parse(data) as Post[];
  } catch (error) {
    console.error("Error loading user posts:", error);
    return [];
  }
};

/**
 * Save a new post to AsyncStorage
 */
export const saveUserPost = async (post: Post): Promise<void> => {
  try {
    const existing = await getUserPosts();
    const updated = [post, ...existing]; // New posts appear first
    await AsyncStorage.setItem(USER_POSTS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Error saving user post:", error);
    throw error;
  }
};

/**
 * Clear all user posts (useful for testing/reset)
 */
export const clearUserPosts = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(USER_POSTS_KEY);
  } catch (error) {
    console.error("Error clearing user posts:", error);
  }
};