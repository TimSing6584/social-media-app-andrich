import { useCallback, useEffect, useMemo, useState } from "react";
import { InteractionManager } from "react-native";
import rawData from "../../../assets/seed.json";
import { getUserPosts } from "../../db";
import { Post } from "../../types/post";

const INITIAL_COUNT = 60;
const BATCH_SIZE = 200;

type FeedState = {
  posts: Post[];
  loading: boolean;
  refresh: () => Promise<void>;
};

/**
 * Incrementally load the large seed dataset + user posts to avoid blocking the UI thread.
 * - User posts appear first (newest first).
 * - Seed data loads incrementally: initial slice for fast first paint, then batches.
 */
export const useFeedData = (): FeedState => {
  const seedPosts = useMemo(() => {
    const parsed = (rawData as { posts?: Post[] }).posts ?? [];
    return parsed;
  }, []);

  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [seedPostsDisplayed, setSeedPostsDisplayed] = useState<Post[]>(() =>
    seedPosts.slice(0, INITIAL_COUNT)
  );
  const [loading, setLoading] = useState<boolean>(true);

  // Load user posts from AsyncStorage
  const loadUserPosts = useCallback(async () => {
    try {
      const posts = await getUserPosts();
      setUserPosts(posts);
    } catch (error) {
      console.error("Error loading user posts:", error);
    }
  }, []);

  // Refresh function to reload user posts (called after creating a new post)
  const refresh = useCallback(async () => {
    await loadUserPosts();
  }, [loadUserPosts]);

  useEffect(() => {
    // Load user posts on mount
    loadUserPosts();

    let cancelled = false;

    const loadRemaining = () => {
      const total = seedPosts.length;
      let cursor = INITIAL_COUNT;

      const appendBatch = () => {
        if (cancelled || cursor >= total) {
          setLoading(false);
          return;
        }

        const nextCursor = Math.min(cursor + BATCH_SIZE, total);
        const batch = seedPosts.slice(cursor, nextCursor);

        setSeedPostsDisplayed((prev) => [...prev, ...batch]);
        cursor = nextCursor;

        // Yield to the event loop to keep the UI responsive.
        scheduleIdle(appendBatch);
      };

      scheduleIdle(appendBatch);
    };

    // Defer heavy work until after initial interactions for smoother mount.
    InteractionManager.runAfterInteractions(loadRemaining);

    return () => {
      cancelled = true;
    };
  }, [seedPosts, loadUserPosts]);

  // Combine user posts (first) with seed posts
  const allPosts = useMemo(() => {
    return [...userPosts, ...seedPostsDisplayed];
  }, [userPosts, seedPostsDisplayed]);

  return { posts: allPosts, loading, refresh };
};

const scheduleIdle =
  typeof requestIdleCallback === "function"
    ? requestIdleCallback
    : (cb: () => void) => setTimeout(cb, 0);

