import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { DEBUG_MODE, DEBUG_TIME, DEBUG_DATE } from "../utils/debugTime";

/**
 * Debug Info Panel
 * Shows which files are using the debug time utility
 * Display this during development to verify debug mode is active
 */
export default function DebugInfoPanel() {
  if (!DEBUG_MODE) {
    return null; // Don't show if debug mode is disabled
  }

  const filesUsingDebugTime = [
    "reserve.tsx - Cafeteria status checking",
    "restaurant.tsx - Time slot calculations",
    "timeslot.tsx - Pickup time slot logic",
    "history.tsx - Order date comparisons",
    "food.tsx - Food availability checking",
    "CafeteriaSelectCard.tsx - Open/closed status",
  ];

  return (
    <View style={styles.container}>
      <View style={styles.debugPanel}>
        <Text style={styles.title}>🐛 DEBUG MODE ACTIVE</Text>
        <Text style={styles.subtitle}>Debug Time: {DEBUG_TIME}</Text>
        {DEBUG_DATE && <Text style={styles.subtitle}>Debug Date: {DEBUG_DATE}</Text>}
        
        <Text style={styles.filesTitle}>Files Using Debug Time:</Text>
        <ScrollView style={styles.filesList}>
          {filesUsingDebugTime.map((file, index) => (
            <Text key={index} style={styles.fileItem}>
              • {file}
            </Text>
          ))}
        </ScrollView>

        <Text style={styles.instructionText}>
          To disable: Set DEBUG_MODE = false in utils/debugTime.ts
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: "#fff3cd",
    borderTopWidth: 2,
    borderTopColor: "#ff6b6b",
  },
  debugPanel: {
    backgroundColor: "#ffe5e5",
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#ff6b6b",
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#d32f2f",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 12,
    color: "#c62828",
    marginBottom: 4,
    fontWeight: "500",
  },
  filesTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#c62828",
    marginTop: 8,
    marginBottom: 6,
  },
  filesList: {
    maxHeight: 120,
    marginBottom: 8,
  },
  fileItem: {
    fontSize: 11,
    color: "#b71c1c",
    marginBottom: 4,
  },
  instructionText: {
    fontSize: 10,
    color: "#8b0000",
    fontStyle: "italic",
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "#ff6b6b",
  },
});
