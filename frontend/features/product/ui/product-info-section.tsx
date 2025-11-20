import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Product } from '../../../entities/product/model/types';

interface ProductInfoSectionProps {
  product: Product;
}

export function ProductInfoSection({ product }: ProductInfoSectionProps) {
  const hasInfo = product.manufacturer || product.country_of_sale || product.source;

  if (!hasInfo) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Product Information</Text>
      <View style={styles.infoList}>
        {product.manufacturer && (
          <InfoRow label="Manufacturer" value={product.manufacturer} />
        )}
        {product.country_of_sale && (
          <InfoRow label="Country of Sale" value={product.country_of_sale} />
        )}
        {product.source && (
          <InfoRow label="Data Source" value={product.source} />
        )}
      </View>
    </View>
  );
}

interface InfoRowProps {
  label: string;
  value: string;
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
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
  infoList: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  label: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  value: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
});

