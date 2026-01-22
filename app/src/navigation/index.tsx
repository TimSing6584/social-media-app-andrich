import React from "react";
import { TouchableOpacity } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../contexts/AuthContext";
import { FeedScreen } from "../features/feed/FeedScreen";
import { CreatePostScreen } from "../features/create-post/CreatePostScreen";
import { AuthScreen } from "../features/auth/AuthScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Tab Navigator (Feed + Create Post)
const TabNavigator: React.FC = () => {
  const { isAuthenticated, signOut } = useAuth();

  const LogoutButton: React.FC = () => {
    if (!isAuthenticated) return null;
    return (
      <TouchableOpacity
        onPress={async () => {
          await signOut();
        }}
        style={{ marginRight: 16 }}
      >
        <Ionicons name="log-out-outline" size={24} color="#007AFF" />
      </TouchableOpacity>
    );
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === "Feed") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Create Post") {
            iconName = focused ? "add-circle" : "add-circle-outline";
          } else {
            iconName = "help-circle";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "gray",
        headerShown: true,
        headerRight: () => <LogoutButton />,
      })}
    >
      <Tab.Screen name="Feed" component={FeedScreen} />
      <Tab.Screen
        name="Create Post"
        component={CreatePostScreen}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            if (!isAuthenticated) {
              e.preventDefault();
              navigation.navigate("Auth" as never);
            }
          },
        })}
      />
    </Tab.Navigator>
  );
};

// Root Stack Navigator (Tabs + Auth)
export const RootNavigator: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="Tabs" component={TabNavigator} />
        ) : (
          <>
            <Stack.Screen name="Tabs" component={TabNavigator} />
            <Stack.Screen
              name="Auth"
              component={AuthScreen}
              options={{ presentation: "modal" }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
