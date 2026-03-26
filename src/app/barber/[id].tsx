import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Text, useThemeColors } from '../../components/ui/Text';
import { Button } from '../../components/ui/Button';
import { useAppStore } from '../../store/useAppStore';
import { MOCK_BARBERS } from '../(tabs)/index'; // simplistic import for MVP

const { width } = Dimensions.get('window');

type TabMenu = 'Services' | 'Reviews' | 'Portfolio' | 'Details';

const MOCK_SERVICES = [
  { id: '1', name: 'Haircut', duration: '30 min', price: 15 },
  { id: '2', name: 'Hair & Beard', duration: '45 min', price: 25 },
  { id: '3', name: 'VIP Cut', duration: '60 min', price: 40 },
];

export default function BarberDetailsScreen() {
  const { id } = useLocalSearchParams();
  const { t } = useTranslation();
  const colors = useThemeColors();
  const router = useRouter();

  const barber = MOCK_BARBERS.find(b => b.id === id) || MOCK_BARBERS[0];
  const { savedBarbers, toggleSavedBarber } = useAppStore();
  const isSaved = savedBarbers.some(b => b.id === barber.id);

  const [activeTab, setActiveTab] = useState<TabMenu>('Services');

  const tabs: TabMenu[] = ['Services', 'Reviews', 'Portfolio', 'Details'];

  const handleBook = (service: any) => {
    router.push({
      pathname: '/booking/[id]',
      params: { id: barber.id, serviceName: service.name }
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* HEADER IMAGES */}
        <View style={styles.headerImages}>
          <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
            {barber.gallery.map((img, i) => (
              <Image key={i} source={{ uri: img }} style={styles.headerImage} />
            ))}
          </ScrollView>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.favButton} onPress={() => toggleSavedBarber(barber)}>
            <Ionicons name={isSaved ? "heart" : "heart-outline"} size={24} color={isSaved ? colors.error : "#000"} />
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
                  activeTab === tab && { borderBottomColor: colors.primary }
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
              {MOCK_SERVICES.map((srv) => (
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
              ))}
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
  }
});
