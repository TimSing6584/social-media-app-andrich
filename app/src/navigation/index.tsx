import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { FeedScreen } from "../features/feed/FeedScreen";
import { CreatePostScreen } from "../features/create-post/CreatePostScreen";

const Tab = createBottomTabNavigator();

export const RootNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Feed" component={FeedScreen} />
        <Tab.Screen name="Create Post" component={CreatePostScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

