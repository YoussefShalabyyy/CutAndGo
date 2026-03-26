import React from 'react';
import { View, StyleSheet, FlatList, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/common/components/ui/Text';
import { Card } from '@/common/components/ui/Card';
import { Badge } from '@/common/components/ui/Badge';
import { useThemeColors } from '@/common/hooks/useThemeColors';
import { useAppointmentsStore } from '../store/useAppointmentsStore';
import { Ionicons } from '@expo/vector-icons';

export default function AppointmentsScreen() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const appointments = useAppointmentsStore((state) => state.appointments);

  if (appointments.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={64} color={colors.textSecondary} />
          <Text variant="h3" weight="medium" style={styles.emptyText}>
            {t('appointments.no_upcoming')}
          </Text>
          <Text variant="body" color={colors.textSecondary} align="center">
            Book an appointment and it will show up here.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text variant="h2" weight="bold" style={styles.header}>
        {t('appointments.upcoming')}
      </Text>
      <FlatList
        data={appointments}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <Card style={styles.cardContainer}>
            <View style={styles.cardHeader}>
              <View style={styles.dateInfo}>
                <Ionicons name="calendar" size={16} color={colors.textSecondary} />
                <Text variant="caption" weight="bold" style={styles.dateText}>
                  {item.date} • {item.time}
                </Text>
              </View>
              <Badge
                label={item.status}
                variant={item.status === 'Confirmed' ? 'success' : 'warning'}
              />
            </View>

            <View style={styles.cardBody}>
              <Image
                source={{ uri: item.image || 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=100&h=100' }}
                style={styles.image}
              />
              <View style={styles.info}>
                <Text variant="h3" weight="bold">{item.barberName}</Text>
                <Text variant="body" color={colors.textSecondary}>{item.service}</Text>
              </View>
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 12,
    marginBottom: 12,
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    marginLeft: 6,
  },
  cardBody: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 16,
  },
  info: {
    flex: 1,
  },
});
