import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text, View } from "react-native";

// TODO: Replace these placeholders with real screens during implementation
const FeedScreen = () => (
  <View>
    <Text>Feed</Text>
  </View>
);

const CreatePostScreen = () => (
  <View>
    <Text>Create Post</Text>
  </View>
);

const Tab = createBottomTabNavigator();

export const RootNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Feed" component={FeedScreen} />
        <Tab.Screen name="CreatePost" component={CreatePostScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

