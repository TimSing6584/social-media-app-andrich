# Social Media App

A mobile social media application built with React Native and Expo, featuring user authentication, post creation, and a dynamic feed.

## 1) Core Features


### a) Authentication Screen:

- Email/password authentication
- Multiple user account support

### b) Feed Tab:

- Displays all posts from all users
- Posts are displayed in a scrollable list
- Each post shows:
  - Title (required field)
  - Author (required field)
  - Description (if provided)
  - Image (if provided)


### ❓ How do I optimize the data loading and display for the large file seed.json?

- FlatList Optimization: Implemented `getItemLayout`, `initialNumToRender`, `maxToRenderPerBatch`, and `windowSize` for efficient virtual scrolling with large datasets
- Image Performance: Used `expo-file-system` to persist images locally, reducing re-fetching and improving rendering performance.
- Lazy Loading: Feed data only loads when tab is accessed using `useFocusEffect`, preventing unnecessary initial load
- Future Scalability: For production-scale datasets, recommend pagination (20–50 posts per batch), migrating to SQLite for structured local storage, and applying image compression (e.g., quality ~0.6) to reduce memory usage.

### c) Create Post Tab

- A form-like page for creating new posts
- The form includes (assume text field unless image):
  - **Title** (required): Maximum 25 characters, emojis are allowed
  - **Author** (required): The user's name or username
  - **Description** (optional): No character limit specified
  - **Image** (optional): Users should be able to select an image from their device
- After creating a post, users are redirected to the Feed tab and see the new post immediately.
<br>

## 2) Tech Stack

- **Framework**: React Native v0.81.5
- **Development Platform**: Expo SDK ~54.0.31
- **Language**: TypeScript
- **Navigation**: React Navigation v7.x
- **Storage**: 
  - AsyncStorage (for posts)
  - Expo SecureStore (for user credentials)
  - Expo FileSystem (for image persistence)
- **Security**: Expo Crypto (SHA-256 password hashing)
- **Architecture**: Feature-based modular structure

<br>

## 3) Technical Implementation Explanation

### a) Database Layer

**AsyncStorage** - Used for storing posts
- Posts are stored as a JSON array in AsyncStorage
- Each post object contains: `title`, `author`, `description`, and `image` URI

**Expo SecureStore** - Used for user credentials
- Users are stored as an encrypted JSON array of objects
- Each user object: `{ email, hashedPassword, biometricEnabled }`
- Provides encrypted storage for sensitive authentication data
- Multi-user support with email as unique identifier

**Expo FileSystem** - Used for image persistence
- Images copied from temporary picker location to permanent `documentDirectory`
- Ensures images persist after app restarts
- Unique filenames generated using timestamps


### ❓Why This Database Choice?

- Quick development and testing
- No server infrastructure needed
- Suitable for assignment demonstration
- Easy local testing on any device
- All data stored securely on device




### b) Authentication System

**Email/Password Implementation**
- SHA-256 password hashing using Expo Crypto before storage
- No passwords stored in plain text
- Email validation with regex pattern matching
- Support for multiple user accounts on same device


### ❓Why don't I implement Biometric Authentication?

- Face ID/Touch ID infrastructure is implemented but disabled
- Not supported in Expo Go for iOS devices
- Requires EAS development build for testing
- Due to time constraints, will be enabled in future releases with proper device builds

## 4) How to run app locally ?


### a) Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/TimSing6584/social-media-app-andrich.git
   ```
2. **Access the project root folder and direct to 'app' folder**
   ```bash
   cd app
   ```
3. **Install dependencies**
    ```bash
    npm install
    ```

### b) Testing on iOS devices

1. Download Expo Go from the App Store on your iOS device
2. Create your account on Expo Go
3. Run the following command on your computer if you want the app to be accessible only within the same network:

   ```bash
   npx expo start
   ```
   Or, if you want the app to be accessible publicly:

   ```bash
   npx expo start --tunnel
   ```
4. Scan the QR code shown in terminal using your iPhone camera
5. The app will open in Expo Go
