import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";
import * as Crypto from "expo-crypto";

const USERS_KEY = "social_media_app_users";
const CURRENT_USER_KEY = "social_media_app_current_user";

interface User {
  email: string;
  hashedPassword: string;
  biometricEnabled: boolean;
}

/**
 * Hash a password using SHA-256
 */
const hashPassword = async (password: string): Promise<string> => {
  const hashed = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    password
  );
  return hashed;
};

/**
 * Get all stored users
 */
const getUsers = async (): Promise<User[]> => {
  try {
    const usersData = await SecureStore.getItemAsync(USERS_KEY);
    return usersData ? JSON.parse(usersData) : [];
  } catch (error) {
    console.error("Error getting users:", error);
    return [];
  }
};

/**
 * Save users array
 */
const saveUsers = async (users: User[]): Promise<void> => {
  try {
    await SecureStore.setItemAsync(USERS_KEY, JSON.stringify(users));
  } catch (error) {
    console.error("Error saving users:", error);
    throw error;
  }
};

/**
 * Find user by email
 */
const findUserByEmail = async (email: string): Promise<User | null> => {
  const users = await getUsers();
  return users.find(user => user.email === email) || null;
};

/**
 * Check if biometric authentication is available on the device
 */
export const isBiometricAvailable = async (): Promise<boolean> => {
  try {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    if (!compatible) return false;

    const enrolled = await LocalAuthentication.isEnrolledAsync();
    return enrolled;
  } catch (error) {
    console.error("Error checking biometric availability:", error);
    return false;
  }
};

/**
 * Get the type of biometric authentication available
 */
export const getBiometricType = async (): Promise<string> => {
  try {
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
    if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      return "Face ID";
    } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      return "Touch ID / Fingerprint";
    } else if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
      return "Iris";
    }
    return "Biometric";
  } catch (error) {
    console.error("Error getting biometric type:", error);
    return "Biometric";
  }
};

/**
 * NOTE: FaceID authentication for iOS is NOT supported in Expo Go.
 * You need to create a development build with EAS to test FaceID.
 * This function is commented out and replaced with a "not supported" message.
 */
// export const authenticateWithBiometrics = async (): Promise<boolean> => {
//   try {
//     const result = await LocalAuthentication.authenticateAsync({
//       promptMessage: "Authenticate to access Create Post",
//       cancelLabel: "Cancel",
//       disableDeviceFallback: false,
//     });
//     return result.success;
//   } catch (error) {
//     console.error("Biometric authentication error:", error);
//     return false;
//   }
// };

/**
 * Get the "not supported" message for biometric in Expo Go
 * This is used until development build is created with EAS
 */
export const getBiometricNotSupportedMessage = (): string => {
  return "Sorry, Face ID is not supported in Expo Go. We will improve this in the future. Please create a development build with EAS to test biometric features.";
};

/**
 * Show message that biometric is not supported in Expo Go
 * This is used until development build is created with EAS
 */
export const showBiometricNotSupported = (callback?: () => void): void => {
  const message = getBiometricNotSupportedMessage();
  console.warn(message);
  if (callback) callback();
};

/**
 * Sign up a new user
 * Returns object with success status and biometricPrompt flag
 */
export const signup = async (
  email: string,
  password: string
): Promise<{success: boolean, message?: string, askBiometric?: boolean}> => {
  try {
    if (!email || !password) {
      return {success: false, message: "Email and password are required"};
    }

    // Check if email already exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return {success: false, message: "Email already exists"};
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Get existing users and add new user
    const users = await getUsers();
    const newUser: User = {
      email,
      hashedPassword,
      biometricEnabled: false,
    };
    users.push(newUser);

    // Save updated users array
    await saveUsers(users);

    // Set as current user
    await SecureStore.setItemAsync(CURRENT_USER_KEY, email);

    // Return success with flag to ask about biometric
    return {
      success: true,
      askBiometric: true
    };
  } catch (error) {
    console.error("Signup error:", error);
    return {success: false, message: "Signup failed. Please try again."};
  }
};

/**
 * Login with email and password ONLY (no biometric)
 * This is separate from biometric login
 */
export const login = async (
  email: string,
  password: string
): Promise<boolean> => {
  try {
    if (!email || !password) {
      return false;
    }

    // Find user by email
    const user = await findUserByEmail(email);
    if (!user) {
      return false; // User not found
    }

    // Hash entered password and compare with stored hash
    const hashedPassword = await hashPassword(password);
    if (hashedPassword === user.hashedPassword) {
      // Passwords match - set as current user
      await SecureStore.setItemAsync(CURRENT_USER_KEY, email);
      return true;
    }

    return false; // Password doesn't match
  } catch (error) {
    console.error("Login error:", error);
    return false;
  }
};

/**
 * Login using biometric authentication
 * NOTE: This function is not fully implemented in Expo Go
 * FaceID requires a development build created with EAS
 * For now, it shows a "not supported" message
 */
export const loginWithBiometric = async (): Promise<boolean> => {
  try {
    // Check if biometric is available
    // NOTE: This check works, but actual authentication doesn't work in Expo Go for iOS
    // const biometricAvailable = await isBiometricAvailable();
    // if (!biometricAvailable) {
    //   return false;
    // }

    // TODO: Implement actual biometric authentication once development build is created
    // const result = await LocalAuthentication.authenticateAsync({
    //   promptMessage: "Sign in with Face ID",
    //   cancelLabel: "Cancel",
    //   disableDeviceFallback: false,
    // });

    // if (!result.success) {
    //   return false;
    // }

    // Find any user with biometric enabled
    // const users = await getUsers();
    // const biometricUser = users.find(user => user.biometricEnabled);

    // if (biometricUser) {
    //   // Set as current user
    //   await SecureStore.setItemAsync(CURRENT_USER_KEY, biometricUser.email);
    //   return true;
    // }

    // For now, show not supported message
    showBiometricNotSupported();
    return false;
  } catch (error) {
    console.error("Biometric login error:", error);
    return false;
  }
};

/**
 * Check current authentication status
 */
export const checkAuthStatus = async (): Promise<{
  isAuthenticated: boolean;
  email: string | null;
}> => {
  try {
    const currentUserEmail = await SecureStore.getItemAsync(CURRENT_USER_KEY);
    if (currentUserEmail) {
      const user = await findUserByEmail(currentUserEmail);
      if (user) {
        return {
          isAuthenticated: true,
          email: currentUserEmail,
        };
      }
    }
    return {
      isAuthenticated: false,
      email: null,
    };
  } catch (error) {
    console.error("Error checking auth status:", error);
    return {
      isAuthenticated: false,
      email: null,
    };
  }
};

/**
 * Update biometric setting for current user
 * NOTE: Due to Expo Go limitations, enabling biometric shows a "not supported" message
 * Actual biometric setup will work after development build is created
 */
export const updateBiometricSetting = async (enabled: boolean): Promise<boolean> => {
  try {
    if (!enabled) {
      // Disabling biometric always works
      const currentUserEmail = await SecureStore.getItemAsync(CURRENT_USER_KEY);
      if (!currentUserEmail) {
        return false;
      }

      const users = await getUsers();
      const userIndex = users.findIndex(user => user.email === currentUserEmail);
      if (userIndex === -1) {
        return false;
      }

      users[userIndex].biometricEnabled = false;
      await saveUsers(users);
      return true;
    }

    // If enabling biometric in Expo Go, show not supported message
    // NOTE: Once development build is created, uncomment the code below:
    // const biometricAvailable = await isBiometricAvailable();
    // if (!biometricAvailable) {
    //   return false;
    // }
    // const biometricSuccess = await authenticateWithBiometrics();
    // if (!biometricSuccess) {
    //   return false;
    // }
    // const currentUserEmail = await SecureStore.getItemAsync(CURRENT_USER_KEY);
    // const users = await getUsers();
    // const userIndex = users.findIndex(user => user.email === currentUserEmail);
    // users[userIndex].biometricEnabled = true;
    // await saveUsers(users);
    // return true;

    showBiometricNotSupported();
    return false;
  } catch (error) {
    console.error("Error updating biometric setting:", error);
    return false;
  }
};

/**
 * Logout user
 */
export const logout = async (): Promise<void> => {
  try {
    // Clear current user but keep user data for future logins
    await SecureStore.deleteItemAsync(CURRENT_USER_KEY);
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
};
