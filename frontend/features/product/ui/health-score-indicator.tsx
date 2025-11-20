import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface HealthScoreIndicatorProps {
  score: number;
}

export function HealthScoreIndicator({ score }: HealthScoreIndicatorProps) {
  const getScoreColor = (score: number) => {
    if (score >= 70) return '#10b981'; // Green
    if (score >= 50) return '#f59e0b'; // Yellow
    return '#ef4444'; // Red
  };

  const getScoreLabel = (score: number) => {
    if (score >= 70) return 'Excellent';
    if (score >= 50) return 'Good';
    if (score >= 30) return 'Fair';
    return 'Poor';
  };

  const color = getScoreColor(score);
  const label = getScoreLabel(score);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="heart" size={24} color={color} />
        <Text style={styles.title}>Health Score</Text>
      </View>
      <View style={styles.scoreContainer}>
        <View style={styles.scoreCircle}>
          <Text style={[styles.scoreText, { color }]}>{score}</Text>
          <Text style={styles.scoreLabel}>/100</Text>
        </View>
        <View style={styles.labelContainer}>
          <Text style={[styles.label, { color }]}>{label}</Text>
        </View>
      </View>
      <View style={styles.barContainer}>
        <View style={[styles.bar, { width: `${score}%`, backgroundColor: color }]} />
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginLeft: 8,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  scoreCircle: {
    alignItems: 'center',
    marginRight: 16,
  },
  scoreText: {
    fontSize: 48,
    fontWeight: 'bold',
    lineHeight: 56,
  },
  scoreLabel: {
    fontSize: 16,
    color: '#999',
    marginTop: -4,
  },
  labelContainer: {
    flex: 1,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
  },
  barContainer: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 4,
  },
});

