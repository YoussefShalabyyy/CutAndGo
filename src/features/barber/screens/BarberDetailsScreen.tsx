import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/common/components/ui/Text';
import { Button } from '@/common/components/ui/Button';
import { useThemeColors } from '@/common/hooks/useThemeColors';
import { Service } from '@/common/types';
import { useFavoritesStore } from '../store/useFavoritesStore';
import { useBarber, useServices } from '../hooks/useBarberHooks';

const { width } = Dimensions.get('window');

type TabMenu = 'Services' | 'Reviews' | 'Portfolio' | 'Details';

export default function BarberDetailsScreen() {
  const { id } = useLocalSearchParams();
  const { t } = useTranslation();
  const colors = useThemeColors();
  const router = useRouter();

  const { data: barber, isLoading: barberLoading } = useBarber(id as string);
  const { data: services, isLoading: servicesLoading } = useServices(id as string);

  const { savedBarbers, toggleSavedBarber } = useFavoritesStore();
  const isSaved = barber ? savedBarbers.some((b) => b.id === barber.id) : false;

  const [activeTab, setActiveTab] = useState<TabMenu>('Services');

  const tabs: TabMenu[] = ['Services', 'Reviews', 'Portfolio', 'Details'];

  const handleBook = (service: Service) => {
    if (!barber) return;
    router.push({
      pathname: '/booking/[id]',
      params: { id: barber.id, serviceName: service.name, serviceId: service.id },
    });
  };

  if (barberLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!barber) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text>Barber not found.</Text>
        <Button title="Go Back" onPress={() => router.back()} style={{ marginTop: 16 }} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

        {/* HEADER IMAGES */}
        <View style={styles.headerImages}>
          <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
            {barber.gallery && barber.gallery.length > 0 ? barber.gallery.map((img, i) => (
              <Image key={i} source={{ uri: img }} style={styles.headerImage} />
            )) : (
              <Image source={{ uri: barber.mainImage }} style={styles.headerImage} />
            )}
          </ScrollView>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.favButton} onPress={() => toggleSavedBarber(barber)}>
            <Ionicons name={isSaved ? 'heart' : 'heart-outline'} size={24} color={isSaved ? colors.error : '#000'} />
          </TouchableOpacity>
        </View>

        {/* INFO */}
        <View style={styles.infoContainer}>
          <View style={styles.titleRow}>
            <View>
              <Text variant="h2" weight="bold">{barber.name}</Text>
              <Text variant="body" color={colors.textSecondary}>{barber.salonName}</Text>
            </View>
            <View style={styles.ratingBox}>
              <Text variant="caption" weight="bold">{barber.rating} ⭐</Text>
              <Text variant="caption" color={colors.textSecondary}>{barber.reviews} revs</Text>
            </View>
          </View>

          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
            <Text variant="body" color={colors.textSecondary} style={{ marginLeft: 6 }}>
              {barber.address} ({barber.distance} km)
            </Text>
          </View>
        </View>

        {/* TABS */}
        <View style={styles.tabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.tabItem,
                  activeTab === tab && { borderBottomColor: colors.primary },
                ]}
                onPress={() => setActiveTab(tab)}
              >
                <Text
                  weight="medium"
                  color={activeTab === tab ? colors.primary : colors.textSecondary}
                >
                  {t(`barber.${tab.toLowerCase()}`)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* TAB CONTENT */}
        <View style={styles.tabContentContainer}>
          {activeTab === 'Services' && (
            <View>
              {servicesLoading ? (
                <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 24 }} />
              ) : services && services.length > 0 ? (
                services.map((srv) => (
                  <View key={srv.id} style={[styles.serviceRow, { borderBottomColor: colors.border }]}>
                    <View style={styles.serviceInfo}>
                      <Text variant="h3" weight="bold">{srv.name}</Text>
                      <Text variant="caption" color={colors.textSecondary}>{srv.duration}</Text>
                      <Text weight="medium" style={styles.price}>${srv.price}</Text>
                    </View>
                    <Button
                      title={t('barber.book')}
                      size="small"
                      onPress={() => handleBook(srv)}
                    />
                  </View>
                ))
              ) : (
                <Text color={colors.textSecondary} style={{ marginTop: 24 }}>No services available.</Text>
              )}
            </View>
          )}

          {activeTab === 'Reviews' && (
            <View style={styles.centerContent}><Text>Reviews coming soon</Text></View>
          )}
          {activeTab === 'Portfolio' && (
            <View style={styles.centerContent}><Text>Portfolio coming soon</Text></View>
          )}
          {activeTab === 'Details' && (
            <View style={styles.centerContent}><Text>Details coming soon</Text></View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerImages: {
    height: 300,
    position: 'relative',
  },
  headerImage: {
    width: width,
    height: 300,
    resizeMode: 'cover',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  favButton: {
    position: 'absolute',
    top: 50,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContainer: {
    padding: 16,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  ratingBox: {
    alignItems: 'flex-end',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tabItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabContentContainer: {
    padding: 16,
  },
  serviceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  serviceInfo: {
    flex: 1,
  },
  price: {
    marginTop: 4,
  },
  centerContent: {
    padding: 32,
    alignItems: 'center',
  },
});
