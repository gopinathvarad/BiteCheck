import React, { useState, useMemo } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppText } from "./AppText";
import { colors, layout } from "../theme";

interface SelectionChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  onRemove?: () => void;
  isCustom?: boolean;
  variant?: "default" | "allergen" | "diet";
}

function SelectionChip({
  label,
  selected,
  onPress,
  onRemove,
  isCustom = false,
  variant = "default",
}: SelectionChipProps) {
  const getColors = () => {
    if (!selected) {
      return {
        bg: colors.card,
        border: colors.border,
        text: colors.text.secondary,
      };
    }
    switch (variant) {
      case "allergen":
        return { bg: "#fef2f2", border: "#ef4444", text: "#dc2626" };
      case "diet":
        return { bg: "#f0fdf4", border: "#22c55e", text: "#16a34a" };
      default:
        return {
          bg: colors.primaryLight,
          border: colors.primary,
          text: colors.primary,
        };
    }
  };

  const chipColors = getColors();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: chipColors.bg,
          borderColor: chipColors.border,
        },
      ]}
      activeOpacity={0.7}
    >
      {selected && (
        <Ionicons
          name="checkmark-circle"
          size={16}
          color={chipColors.text}
          style={styles.chipIcon}
        />
      )}
      <AppText
        variant="caption"
        style={[styles.chipText, { color: chipColors.text }]}
      >
        {label}
      </AppText>
      {isCustom && selected && onRemove && (
        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.removeButton}
        >
          <Ionicons name="close-circle" size={16} color={chipColors.text} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

interface PreferencesSectionProps {
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  variant: "allergen" | "diet";
  items: string[];
  selectedItems: string[];
  customItems: string[];
  onToggleItem: (item: string) => void;
  onAddCustom: (item: string) => boolean;
  onRemoveCustom: (item: string) => void;
  onClearAll: () => void;
  customInputPlaceholder?: string;
}

export function PreferencesSection({
  title,
  description,
  icon,
  iconColor,
  variant,
  items,
  selectedItems,
  customItems,
  onToggleItem,
  onAddCustom,
  onRemoveCustom,
  onClearAll,
  customInputPlaceholder = "Add custom...",
}: PreferencesSectionProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [customInput, setCustomInput] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Check if an item is selected (case-insensitive)
  const isSelected = (item: string) =>
    selectedItems.some((s) => s.toLowerCase() === item.toLowerCase());

  // Check if item is custom
  const isCustom = (item: string) =>
    customItems.some((c) => c.toLowerCase() === item.toLowerCase());

  // Filter items based on search
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    return items.filter((item) =>
      item.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [items, searchQuery]);

  // Handle adding custom item
  const handleAddCustom = () => {
    if (customInput.trim()) {
      const success = onAddCustom(customInput.trim());
      if (success) {
        setCustomInput("");
        setShowCustomInput(false);
        Keyboard.dismiss();
      }
    }
  };

  const selectedCount = selectedItems.length;

  return (
    <View style={styles.section}>
      {/* Header */}
      <View style={styles.sectionHeader}>
        <Ionicons name={icon} size={20} color={iconColor} />
        <AppText variant="h3" style={styles.sectionTitle}>
          {title}
        </AppText>
        {selectedCount > 0 && (
          <View style={[styles.countBadge, { backgroundColor: iconColor }]}>
            <AppText variant="caption" style={styles.countText}>
              {selectedCount}
            </AppText>
          </View>
        )}
      </View>

      {/* Description */}
      <AppText
        variant="caption"
        color={colors.text.secondary}
        style={styles.sectionDescription}
      >
        {description}
      </AppText>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={18}
          color={colors.text.tertiary}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder={`Search ${title.toLowerCase()}...`}
          placeholderTextColor={colors.text.tertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchQuery("")}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name="close-circle"
              size={18}
              color={colors.text.tertiary}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Chips Container */}
      <View style={styles.chipsContainer}>
        {filteredItems.map((item) => (
          <SelectionChip
            key={item}
            label={item}
            selected={isSelected(item)}
            onPress={() => onToggleItem(item)}
            variant={variant}
          />
        ))}

        {/* Custom items */}
        {customItems
          .filter(
            (c) => !items.some((i) => i.toLowerCase() === c.toLowerCase())
          )
          .filter(
            (c) =>
              !searchQuery.trim() ||
              c.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .map((item) => (
            <SelectionChip
              key={`custom-${item}`}
              label={item}
              selected={true}
              onPress={() => onRemoveCustom(item)}
              onRemove={() => onRemoveCustom(item)}
              isCustom={true}
              variant={variant}
            />
          ))}
      </View>

      {/* Add Custom Button/Input */}
      {showCustomInput ? (
        <View style={styles.customInputContainer}>
          <TextInput
            style={styles.customInput}
            placeholder={customInputPlaceholder}
            placeholderTextColor={colors.text.tertiary}
            value={customInput}
            onChangeText={setCustomInput}
            onSubmitEditing={handleAddCustom}
            autoFocus
            autoCapitalize="words"
            returnKeyType="done"
          />
          <TouchableOpacity
            style={[
              styles.addButton,
              !customInput.trim() && styles.addButtonDisabled,
            ]}
            onPress={handleAddCustom}
            disabled={!customInput.trim()}
          >
            <Ionicons name="add" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => {
              setShowCustomInput(false);
              setCustomInput("");
            }}
          >
            <Ionicons name="close" size={20} color={colors.text.secondary} />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.addCustomButton}
          onPress={() => setShowCustomInput(true)}
        >
          <Ionicons
            name="add-circle-outline"
            size={18}
            color={colors.primary}
          />
          <AppText variant="caption" style={styles.addCustomText}>
            Add custom {title.toLowerCase().replace(/s$/, "")}
          </AppText>
        </TouchableOpacity>
      )}

      {/* Footer with count and clear all */}
      <View style={styles.sectionFooter}>
        {selectedCount > 0 ? (
          <>
            <AppText
              variant="caption"
              color={colors.text.tertiary}
              style={styles.selectedCount}
            >
              {selectedCount} {selectedCount === 1 ? "item" : "items"} selected
            </AppText>
            <TouchableOpacity onPress={onClearAll} style={styles.clearButton}>
              <Ionicons name="trash-outline" size={14} color="#dc2626" />
              <AppText variant="caption" style={styles.clearButtonText}>
                Clear all
              </AppText>
            </TouchableOpacity>
          </>
        ) : (
          <AppText
            variant="caption"
            color={colors.text.tertiary}
            style={styles.selectedCount}
          >
            No items selected
          </AppText>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: colors.card,
    borderRadius: layout.borderRadius.l,
    padding: layout.spacing.l,
    marginBottom: layout.spacing.m,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: layout.spacing.s,
    marginBottom: layout.spacing.xs,
  },
  sectionTitle: {
    flex: 1,
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    minWidth: 24,
    alignItems: "center",
  },
  countText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 12,
  },
  sectionDescription: {
    marginBottom: layout.spacing.m,
    lineHeight: 18,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: layout.borderRadius.m,
    paddingHorizontal: 12,
    marginBottom: layout.spacing.m,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text.primary,
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: layout.spacing.s,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  chipIcon: {
    marginRight: 4,
  },
  chipText: {
    fontWeight: "500",
  },
  removeButton: {
    marginLeft: 4,
  },
  customInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: layout.spacing.m,
    gap: layout.spacing.s,
  },
  customInput: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: layout.borderRadius.m,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text.primary,
  },
  addButton: {
    backgroundColor: colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  cancelButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  addCustomButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: layout.spacing.m,
    gap: layout.spacing.xs,
  },
  addCustomText: {
    color: colors.primary,
    fontWeight: "500",
  },
  sectionFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: layout.spacing.m,
    paddingTop: layout.spacing.m,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  selectedCount: {
    fontStyle: "italic",
  },
  clearButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  clearButtonText: {
    color: "#dc2626",
    fontWeight: "500",
  },
});
