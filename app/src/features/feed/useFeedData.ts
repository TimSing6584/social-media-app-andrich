import { useEffect, useMemo, useState } from "react";
import { InteractionManager } from "react-native";
import rawData from "../../../assets/seed.json";
import { Post } from "../../types/post";

const INITIAL_COUNT = 60;
const BATCH_SIZE = 200;

type FeedState = {
  posts: Post[];
  loading: boolean;
};

/**
 * Incrementally load the large seed dataset to avoid blocking the UI thread.
 * - Take an initial slice for fast first paint.
 * - Append in batches after interactions complete, yielding between batches.
 */
export const useFeedData = (): FeedState => {
  const allPosts = useMemo(() => {
    const parsed = (rawData as { posts?: Post[] }).posts ?? [];
    return parsed;
  }, []);

  const [posts, setPosts] = useState<Post[]>(() =>
    allPosts.slice(0, INITIAL_COUNT)
  );
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;

    const loadRemaining = () => {
      const total = allPosts.length;
      let cursor = INITIAL_COUNT;

      const appendBatch = () => {
        if (cancelled || cursor >= total) {
          setLoading(false);
          return;
        }

        const nextCursor = Math.min(cursor + BATCH_SIZE, total);
        const batch = allPosts.slice(cursor, nextCursor);

        setPosts((prev) => [...prev, ...batch]);
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
  }, [allPosts]);

  return { posts, loading };
};

const scheduleIdle =
  typeof requestIdleCallback === "function"
    ? requestIdleCallback
    : (cb: () => void) => setTimeout(cb, 0);

