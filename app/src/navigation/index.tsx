import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { FeedScreen } from "../features/feed/FeedScreen";
import { CreatePostScreen } from "../features/create-post/CreatePostScreen";

const Tab = createBottomTabNavigator();

export const RootNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap;

            if (route.name === "Feed") {
              iconName = focused ? "home" : "home-outline";
            } else if (route.name === "Create Post") {
              iconName = focused ? "add-circle" : "add-circle-outline";
            } else {
              iconName = "help-circle"; // Fallback
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: "#007AFF", // Modern blue
          tabBarInactiveTintColor: "gray",
          headerShown: false, // Hide headers for cleaner look
        })}
      >
        <Tab.Screen
          name="Feed"
          component={FeedScreen}
          options={{ headerShown: true, title: 'Feed' }}
        />
        <Tab.Screen name="Create Post" component={CreatePostScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

