import React, { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Dimensions
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { documentDirectory, copyAsync } from "expo-file-system/legacy";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { saveUserPost } from "../../db";
import { Post } from "../../types/post";

const MAX_TITLE_LENGTH = 25;
const { height } = Dimensions.get('window');
export const CreatePostScreen: React.FC = () => {
  const { top, bottom } = useSafeAreaInsets();
  const navigation = useNavigation();
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const titleLength = title.length;
  const isTitleValid = title.trim().length > 0 && titleLength <= MAX_TITLE_LENGTH;
  const isFormValid = isTitleValid && author.trim().length > 0;

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "We need access to your photos to select an image."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const removeImage = () => {
    setImageUri(null);
  };

  const handleSubmit = async () => {
    if (!isFormValid) {
      Alert.alert("Validation Error", "Please fill in all required fields correctly.");
      return;
    }

    setSubmitting(true);

    try {
      let permanentImageUri = undefined;
      if (imageUri) {
        try {
          // Create a unique filename
          const filename = `post_image_${Date.now()}.jpg`;
          const permanentUri = `${documentDirectory}${filename}`;
          // Copy the temporary file to permanent storage
          await copyAsync({
            from: imageUri,
            to: permanentUri,
          });

          permanentImageUri = permanentUri;
        } catch (error) {
          console.error('Error saving image permanently:', error);
          Alert.alert('Error', 'Failed to save image. Please try again.');
          return;
        }
      }

      const newPost: Post = {
        title: title.trim(),
        author: author.trim(),
        description: description.trim() || undefined,
        image: permanentImageUri,
      };

      await saveUserPost(newPost);

      // Reset form
      setTitle("");
      setAuthor("");
      setDescription("");
      setImageUri(null);

      Alert.alert("Success", "Your post has been created!", [
        { text: "OK", onPress: () => {
          // Navigate to Feed tab
          (navigation as any).navigate("Tabs", { screen: "Feed" });
        }},
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to create post. Please try again.");
      console.error("Error creating post:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: 16 + top, paddingBottom: 16 + bottom },
      ]}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.form}>
        <View style={styles.field}>
          <Text style={styles.label}>
            Title <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, !isTitleValid && titleLength > 0 && styles.inputError]}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter post title (max 25 characters)"
            placeholderTextColor="#999"
            maxLength={MAX_TITLE_LENGTH}
            editable={!submitting}
          />
          <Text
            style={[
              styles.charCount,
              titleLength > MAX_TITLE_LENGTH && styles.charCountError,
            ]}
          >
            {titleLength}/{MAX_TITLE_LENGTH}
          </Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>
            Author <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={author}
            onChangeText={setAuthor}
            placeholder="Enter your name or username"
            placeholderTextColor="#999"
            editable={!submitting}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Description (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Enter post description..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            editable={!submitting}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Image (Optional)</Text>
          {imageUri ? (
            <View style={styles.imageContainer}>
              <Image source={{ uri: imageUri }} style={styles.previewImage} />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={removeImage}
                disabled={submitting}
              >
                <Text style={styles.removeImageText}>Remove Image</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.imagePickerButton}
              onPress={pickImage}
              disabled={submitting}
            >
              <Text style={styles.imagePickerText}>Select Image</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[styles.submitButton, (!isFormValid || submitting) && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={!isFormValid || submitting}
        >
          <Text style={styles.submitButtonText}>
            {submitting ? "Creating..." : "Create Post"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f7f7",
  },
  content: {
    paddingHorizontal: 16,
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
  required: {
    color: "#e74c3c",
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
  inputError: {
    borderColor: "#e74c3c",
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  charCount: {
    fontSize: 12,
    color: "#666",
    textAlign: "right",
  },
  charCountError: {
    color: "#e74c3c",
    fontWeight: "600",
  },
  imageContainer: {
    gap: 8,
  },
  previewImage: {
    width: "100%",
    height: height * 0.3,
    borderRadius: 8,
    backgroundColor: "#ececec",
  },
  imagePickerButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderStyle: "dashed",
    borderRadius: 8,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  imagePickerText: {
    fontSize: 15,
    color: "#666",
  },
  removeImageButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e74c3c",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  removeImageText: {
    fontSize: 14,
    color: "#e74c3c",
    fontWeight: "600",
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
});