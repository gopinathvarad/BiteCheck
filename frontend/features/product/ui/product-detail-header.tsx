import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { Product } from '../../../entities/product/model/types';

interface ProductDetailHeaderProps {
  product: Product;
}

export function ProductDetailHeader({ product }: ProductDetailHeaderProps) {
  const imageUrl = product.images && product.images.length > 0 ? product.images[0] : null;

  return (
    <View style={styles.container}>
      {/* Product Image */}
      {imageUrl ? (
        <ExpoImage
          source={{ uri: imageUrl }}
          style={styles.image}
          contentFit="cover"
          transition={200}
          placeholderContentFit="cover"
        />
      ) : (
        <View style={[styles.image, styles.placeholderImage]}>
          <Text style={styles.placeholderText}>No Image</Text>
        </View>
      )}

      {/* Product Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{product.name}</Text>
        {product.brand && (
          <Text style={styles.brand}>{product.brand}</Text>
        )}
        {product.category && (
          <View style={styles.categoryContainer}>
            <Text style={styles.category}>{product.category}</Text>
          </View>
        )}
        {product.barcode && (
          <Text style={styles.barcode}>Barcode: {product.barcode}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
  },
  image: {
    width: '100%',
    height: 300,
    backgroundColor: '#f5f5f5',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 16,
    color: '#999',
  },
  infoContainer: {
    padding: 20,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
    lineHeight: 34,
  },
  brand: {
    fontSize: 18,
    color: '#666',
    marginBottom: 12,
    fontWeight: '500',
  },
  categoryContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 12,
  },
  category: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  barcode: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'monospace',
  },
});

