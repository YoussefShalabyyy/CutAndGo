import { Badge } from '@/common/components/ui/Badge';
import { Card } from '@/common/components/ui/Card';
import { Input } from '@/common/components/ui/Input';
import { Text } from '@/common/components/ui/Text';
import { useThemeColors } from '@/common/hooks/useThemeColors';
import { Barber } from '@/common/types';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Image, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MOCK_BARBERS } from '../data/mockBarbers';

export default function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const colors = useThemeColors();

  const renderBarberCard = ({ item }: { item: Barber }) => {
    return (
      <Card
        noPadding
        style={styles.cardContainer}
        onPress={() => router.push(`/barber/${item.id}`)}
      >
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.mainImage }} style={styles.mainImage} />
          <View style={styles.ratingBadge}>
            <Text variant="caption" weight="bold" color="#000">{item.rating} ⭐</Text>
            <Text variant="caption" color="#666">({item.reviews} reviews)</Text>
          </View>
        </View>

        <View style={styles.galleryContainer}>
          {item.gallery.map((img, idx) => (
            <Image key={idx} source={{ uri: img }} style={styles.galleryImage} />
          ))}
        </View>

        <View style={styles.infoContainer}>
          <Badge label={t('home.recommended')} variant="primary" style={styles.badge} />

          <Text variant="h3" weight="bold" style={styles.name}>{item.name}</Text>
          <Text variant="body" color={colors.textSecondary} style={styles.salonName}>{item.salonName}</Text>

          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
            <Text variant="caption" color={colors.textSecondary} style={styles.address}>
              {item.distance} km • {item.address}
            </Text>
          </View>
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Input
          placeholder={t('home.search_placeholder')}
          leftIcon={<Ionicons name="search" size={20} color={colors.textSecondary} />}
          containerStyle={styles.searchInput}
        />
      </View>
      <View>

        <FlatList
          data={MOCK_BARBERS}
          keyExtractor={(item) => item.id}
          renderItem={renderBarberCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  searchInput: { marginBottom: 0 },
  listContent: { padding: 16, paddingBottom: 32 },
  cardContainer: { marginBottom: 24 },
  imageContainer: { position: 'relative', height: 200 },
  mainImage: { width: '100%', height: '100%' },
  ratingBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
  },
  galleryContainer: { flexDirection: 'row', height: 80, borderTopWidth: 2, borderTopColor: '#fff' },
  galleryImage: { flex: 1, height: '100%', borderRightWidth: 1, borderRightColor: '#fff' },
  infoContainer: { padding: 16 },
  badge: { marginBottom: 12 },
  name: { marginBottom: 4 },
  salonName: { marginBottom: 12 },
  locationContainer: { flexDirection: 'row', alignItems: 'center' },
  address: { marginLeft: 4 },
});
