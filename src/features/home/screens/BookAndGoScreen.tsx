import React from 'react';
import { View, StyleSheet, FlatList, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/common/components/ui/Text';
import { Card } from '@/common/components/ui/Card';
import { useThemeColors } from '@/common/hooks/useThemeColors';
import { useFavoritesStore } from '@/features/barber/store/useFavoritesStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function BookAndGoScreen() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const savedBarbers = useFavoritesStore((state) => state.savedBarbers);
  const router = useRouter();

  if (savedBarbers.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={64} color={colors.textSecondary} />
          <Text variant="h3" weight="medium" style={styles.emptyText}>
            No saved barbers yet
          </Text>
          <Text variant="body" color={colors.textSecondary} align="center">
            Barbers you save will appear here for quick booking.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text variant="h2" weight="bold" style={styles.header}>
        Saved Barbers
      </Text>
      <FlatList
        data={savedBarbers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <Card
            style={styles.cardContainer}
            onPress={() => router.push(`/barber/${item.id}`)}
          >
            <View style={styles.cardContent}>
              <Image source={{ uri: item.mainImage }} style={styles.image} />
              <View style={styles.info}>
                <Text variant="h3" weight="bold">{item.name}</Text>
                <Text variant="body" color={colors.textSecondary}>{item.salonName}</Text>
                <View style={styles.ratingRow}>
                  <Text variant="caption" weight="medium">{item.rating} ⭐</Text>
                  <Text variant="caption" color={colors.textSecondary} style={styles.reviews}>
                    ({item.reviews} reviews)
                  </Text>
                </View>
              </View>
              <Ionicons name="heart" size={24} color={colors.primary} />
            </View>
          </Card>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
  },
  listContent: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    marginTop: 16,
    marginBottom: 8,
  },
  cardContainer: {
    marginBottom: 16,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    width: 64,
    height: 64,
    borderRadius: 8,
    marginRight: 16,
  },
  info: {
    flex: 1,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  reviews: {
    marginLeft: 4,
  },
});
