import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Product } from '../../../entities/product/model/types';

interface IngredientsSectionProps {
  product: Product;
}

export function IngredientsSection({ product }: IngredientsSectionProps) {
  const hasIngredients = product.ingredients_raw || (product.ingredients_parsed && product.ingredients_parsed.length > 0);

  if (!hasIngredients) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Ingredients</Text>
        <Text style={styles.noDataText}>Ingredients information not available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Ingredients</Text>
      {product.ingredients_parsed && product.ingredients_parsed.length > 0 ? (
        <View style={styles.parsedContainer}>
          {product.ingredients_parsed.map((ingredient, index) => (
            <View key={index} style={styles.ingredientItem}>
              <View style={styles.bullet} />
              <Text style={styles.ingredientText}>{ingredient}</Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.rawText}>{product.ingredients_raw}</Text>
      )}
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  parsedContainer: {
    gap: 8,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#6B46C1',
    marginTop: 8,
    marginRight: 12,
  },
  ingredientText: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  rawText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  noDataText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
});

