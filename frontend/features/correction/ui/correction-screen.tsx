import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { submitCorrection } from "../service/correction-service";

export default function CorrectionScreen() {
  const { productId, fieldName, oldValue } = useLocalSearchParams<{
    productId: string;
    fieldName: string;
    oldValue: string;
  }>();
  const router = useRouter();
  const [newValue, setNewValue] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!newValue.trim()) {
      Alert.alert("Error", "Please enter a new value");
      return;
    }

    if (!productId || !fieldName) {
      Alert.alert("Error", "Missing product information");
      return;
    }

    setLoading(true);
    try {
      await submitCorrection({
        product_id: productId,
        field_name: fieldName,
        old_value: oldValue || "",
        new_value: newValue,
      });
      Alert.alert("Success", "Correction submitted successfully", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to submit correction");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Suggest Correction" }} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.infoContainer}>
          <Text style={styles.label}>Field</Text>
          <Text style={styles.value}>{fieldName}</Text>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.label}>Current Value</Text>
          <Text style={styles.value}>{oldValue || "(Empty)"}</Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>New Value</Text>
          <TextInput
            style={styles.input}
            value={newValue}
            onChangeText={setNewValue}
            placeholder="Enter correct value"
            placeholderTextColor="#999"
            multiline
          />
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Submit Correction</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    padding: 20,
  },
  infoContainer: {
    marginBottom: 20,
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eee",
  },
  inputContainer: {
    marginBottom: 30,
  },
  label: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
    fontWeight: "600",
  },
  value: {
    fontSize: 16,
    color: "#333",
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    color: "#333",
    minHeight: 50,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
