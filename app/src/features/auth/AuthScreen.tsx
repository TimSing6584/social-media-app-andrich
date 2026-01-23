import React, { useEffect, useState } from "react";
import {
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../contexts/AuthContext";
import {
  loginWithBiometric,
  getBiometricNotSupportedMessage,
  isBiometricAvailable,
  getBiometricType
} from "../../services/authService";

type AuthMode = "login" | "signup";

// More comprehensive email validation
const isValidEmail = (email: string): boolean => {
  // RFC 5322 compliant email regex (more strict)
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  if (!emailRegex.test(email)) {
    return false;
  }
  const domain = email.split('@')[1]?.toLowerCase();

  // Ensure TLD has at least 2 characters
  const tld = domain?.split('.').pop();
  if (!tld || tld.length < 2) {
    return false;
  }

  return true;
};
export const AuthScreen: React.FC = () => {
  const navigation = useNavigation();
  const { top, bottom } = useSafeAreaInsets();
  const { authenticate, signUp, isAuthenticated } = useAuth();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState<string>("Biometric");

  useEffect(() => {
    const checkBiometric = async () => {
      const available = await isBiometricAvailable();
      const type = await getBiometricType();
      setBiometricAvailable(available);
      setBiometricType(type);
    };
    checkBiometric();
  }, []);

  // Navigate back to Create Post after successful authentication
  useEffect(() => {
    if (isAuthenticated) {
      navigation.goBack();
    }
  }, [isAuthenticated, navigation]);

  const handleBiometricAuth = async () => {
    if (!biometricAvailable) {
      Alert.alert(
        "Biometric Not Available",
        "Biometric authentication is not available on this device."
      );
      return;
    }

    setLoading(true);
    try {
      const success = await loginWithBiometric();
      if (!success) {
        // Show the "not supported" message
        const notSupportedMessage = getBiometricNotSupportedMessage();
        Alert.alert("Face ID Not Supported", notSupportedMessage);
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred during biometric authentication.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Validation Error", "Please enter both email and password.");
      return;
    }

    if (!isValidEmail(email.trim())) {
      Alert.alert("Validation Error", "Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "signup") {
        const result = await signUp(email.trim().toLowerCase(), password);
        if (result.success) {
          Alert.alert("Success", "Account created successfully!");

          // If askBiometric is true, show biometric popup
          if (result.askBiometric) {
            Alert.alert(
              "Add Face ID",
              "Would you like to add Face ID for faster login?",
              [
                {
                  text: "Not Now",
                  onPress: () => {
                    // User declined biometric
                  },
                  style: "cancel",
                },
                {
                  text: "Yes",
                  onPress: async () => {
                    // User wants to add biometric
                    const notSupportedMessage = getBiometricNotSupportedMessage();
                    Alert.alert("Face ID Not Supported", notSupportedMessage);
                  },
                },
              ]
            );
          }
        } else {
          Alert.alert("Error", "Failed to create account. Email may already exist.");
        }
      } else {
        const success = await authenticate(email.trim().toLowerCase(), password);
        if (!success) {
          Alert.alert("Error", "Invalid email or password.");
        }
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getBiometricIcon = (): keyof typeof Ionicons.glyphMap => {
    if (biometricType.includes("Face")) {
      return "person-circle";
    } else if (biometricType.includes("Fingerprint") || biometricType.includes("Touch")) {
      return "finger-print";
    }
    return "lock-closed";
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: 20 + top, paddingBottom: 20 + bottom },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Ionicons
            name="lock-closed"
            size={64}
            color="#007AFF"
            style={styles.icon}
          />
          <Text style={styles.title}>
            {mode === "login" ? "Welcome Back" : "Create Account"}
          </Text>
          <Text style={styles.subtitle}>
            {mode === "login"
              ? "Sign in to create posts"
              : "Sign up to get started"}
          </Text>
        </View>

        {biometricAvailable && mode === "login" && (
          <TouchableOpacity
            style={styles.biometricButton}
            onPress={handleBiometricAuth}
            disabled={loading}
          >
            <Ionicons
              name={getBiometricIcon()}
              size={24}
              color="#fff"
            />
            <Text style={styles.biometricButtonText}>
              Use {biometricType}
            </Text>
          </TouchableOpacity>
        )}

        {biometricAvailable && mode === "login" && (
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>
        )}

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              placeholderTextColor="#999"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              editable={!loading}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              placeholderTextColor="#999"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
          </View>

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>
                {mode === "login" ? "Sign In" : "Sign Up"}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.switchModeButton}
            onPress={() => {
              setMode(mode === "login" ? "signup" : "login");
              setEmail("");
              setPassword("");
            }}
            disabled={loading}
          >
            <Text style={styles.switchModeText}>
              {mode === "login"
                ? "Don't have an account? Sign Up"
                : "Already have an account? Sign In"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f7f7",
  },
  content: {
    paddingHorizontal: 24,
    minHeight: "100%",
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  biometricButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007AFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 8,
  },
  biometricButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#ddd",
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: "#999",
  },
  form: {
    gap: 20,
  },
  field: {
    gap: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: "#333",
  },
  submitButton: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  submitButtonDisabled: {
    backgroundColor: "#ccc",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  switchModeButton: {
    padding: 12,
    alignItems: "center",
  },
  switchModeText: {
    fontSize: 14,
    color: "#007AFF",
  },
});
