import React, { useState } from "react";
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Platform,
} from "react-native";
import Typography from "@/components/typography";
import { Ionicons } from "@expo/vector-icons";

interface APIKeyModalProps {
  visible: boolean;
  onSubmit: (apiKey: string) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function APIKeyModal({
  visible,
  onSubmit,
  onCancel,
  isLoading = false,
}: APIKeyModalProps) {
  const [apiKey, setApiKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);

  const handleSubmit = async () => {
    if (!apiKey.trim()) {
      setError("API Key is required");
      return;
    }

    if (!apiKey.startsWith("gsk_")) {
      setError("Please enter a valid Groq API key (starts with 'gsk_')");
      return;
    }

    try {
      setError(null);
      await onSubmit(apiKey);
      setApiKey("");
    } catch (err) {
      setError("Failed to save API key");
    }
  };

  const handleModalClose = () => {
    if (!isLoading) {
      setApiKey("");
      setError(null);
      setShowKey(false);
      onCancel();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleModalClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <Typography
              weight="bold"
              size={20}
              style={styles.headerTitle}
            >
              API Key Required
            </Typography>
            {!isLoading && (
              <TouchableOpacity
                onPress={handleModalClose}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            )}
          </View>

          {/* Info Text */}
          <View style={styles.infoSection}>
            <Typography
              size={14}
              style={styles.infoText}
            >
              Enter your Groq API key to use the AI meal suggestion feature.
            </Typography>
            <Typography
              size={12}
              style={styles.subInfoText}
            >
              Get a free API key at{" "}
              <Typography
                weight="bold"
                size={12}
                style={styles.linkText}
              >
                console.groq.com
              </Typography>
            </Typography>
          </View>

          {/* Input Field */}
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Enter Groq API key (gsk_...)"
                placeholderTextColor="#999"
                value={apiKey}
                onChangeText={(text) => {
                  setApiKey(text);
                  setError(null);
                }}
                secureTextEntry={!showKey}
                editable={!isLoading}
              />
              {apiKey.length > 0 && (
                <TouchableOpacity
                  onPress={() => setShowKey(!showKey)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showKey ? "eye" : "eye-off"}
                    size={20}
                    color="#E95D91"
                  />
                </TouchableOpacity>
              )}
            </View>

            {error && (
              <Typography
                size={12}
                style={styles.errorText}
              >
                {error}
              </Typography>
            )}
          </View>

          {/* Info Box */}
          <View style={styles.warningBox}>
            <Ionicons name="information-circle" size={16} color="#E95D91" />
            <Typography
              size={11}
              style={styles.warningText}
            >
              Your API key is stored locally on your device and only used for AI suggestions.
            </Typography>
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleModalClose}
              disabled={isLoading}
            >
              <Typography
                weight="bold"
                size={14}
                style={styles.cancelButtonText}
              >
                Cancel
              </Typography>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.submitButton, isLoading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isLoading || !apiKey.trim()}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Typography
                  weight="bold"
                  size={14}
                  style={styles.submitButtonText}
                >
                  Continue
                </Typography>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  modal: {
    width: "85%",
    backgroundColor: "#FFF",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 24,
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  headerTitle: {
    color: "#333",
    flex: 1,
  },

  closeButton: {
    padding: 5,
  },

  infoSection: {
    marginBottom: 18,
  },

  infoText: {
    color: "#555",
    marginBottom: 8,
    lineHeight: 20,
  },

  subInfoText: {
    color: "#888",
  },

  linkText: {
    color: "#E95D91",
    textDecorationLine: "underline",
  },

  inputContainer: {
    marginBottom: 16,
  },

  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: "#FAFAFA",
  },

  input: {
    flex: 1,
    height: 48,
    fontSize: 14,
    color: "#333",
    fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
  },

  eyeIcon: {
    padding: 8,
  },

  errorText: {
    color: "#E74C3C",
    marginTop: 8,
  },

  warningBox: {
    flexDirection: "row",
    backgroundColor: "rgba(233, 93, 145, 0.1)",
    borderLeftWidth: 3,
    borderLeftColor: "#E95D91",
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    alignItems: "flex-start",
  },

  warningText: {
    color: "#666",
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
  },

  buttonContainer: {
    flexDirection: "row",
    gap: 12,
  },

  button: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  cancelButton: {
    backgroundColor: "#F0F0F0",
  },

  cancelButtonText: {
    color: "#666",
  },

  submitButton: {
    backgroundColor: "#E95D91",
  },

  submitButtonDisabled: {
    backgroundColor: "rgba(233, 93, 145, 0.5)",
  },

  submitButtonText: {
    color: "#FFF",
  },
});
