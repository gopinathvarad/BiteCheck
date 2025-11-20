import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AllergensSectionProps {
  allergens?: string[];
}

export function AllergensSection({ allergens }: AllergensSectionProps) {
  if (!allergens || allergens.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Allergens</Text>
        <View style={styles.noAllergensContainer}>
          <Ionicons name="checkmark-circle" size={24} color="#10b981" />
          <Text style={styles.noAllergensText}>No allergens listed</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="warning" size={24} color="#ef4444" />
        <Text style={styles.sectionTitle}>Allergens</Text>
      </View>
      <View style={styles.allergensContainer}>
        {allergens.map((allergen, index) => (
          <View key={index} style={styles.allergenTag}>
            <Ionicons name="alert-circle" size={16} color="#ef4444" />
            <Text style={styles.allergenText}>{allergen}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginLeft: 8,
  },
  allergensContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  allergenTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  allergenText: {
    fontSize: 14,
    color: '#dc2626',
    fontWeight: '600',
  },
  noAllergensContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  noAllergensText: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '500',
  },
});

