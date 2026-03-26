import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Keyboard, Pressable, SafeAreaView, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { MOCK_BARBERS } from '../(tabs)/index'; // simple import for MVP
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Text, useThemeColors } from '../../components/ui/Text';
import { useAppStore } from '../../store/useAppStore';

type BookingStep = 'Date' | 'Phone' | 'OTP' | 'Success';

const TIME_SLOTS = [
  '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM',
  '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
];

export default function BookingScreen() {
  const { id, serviceName } = useLocalSearchParams();
  const { t } = useTranslation();
  const colors = useThemeColors();
  const router = useRouter();
  const addAppointment = useAppStore(state => state.addAppointment);

  const barber = MOCK_BARBERS.find(b => b.id === id) || MOCK_BARBERS[0];

  const [step, setStep] = useState<BookingStep>('Date');
  const [selectedDate, setSelectedDate] = useState('2023-11-20'); // Mock selected date
  const [selectedTime, setSelectedTime] = useState('12:30 PM');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');

  const [loading, setLoading] = useState(false);

  const handleNextDate = () => setStep('Phone');

  const handleNextPhone = () => {
    if (phone.length > 5) setStep('OTP');
  };

  const handleVerifyOtp = () => {
    if (otp.length === 4) {
      setLoading(true);
      setTimeout(() => {
        // mock API call
        addAppointment({
          id: Math.random().toString(),
          barberName: barber.name,
          service: (serviceName as string) || 'Haircut',
          date: 'Nov 20, 2023',
          time: selectedTime,
          status: 'Confirmed',
          image: barber.mainImage
        });
        setLoading(false);
        setStep('Success');
      }, 1000);
    }
  };

  const handleFinish = () => {
    router.replace('/(tabs)/appointments');
  };

  const renderHeader = (title: string, showBack = true) => (
    <View style={styles.header}>
      {showBack ? (
        <TouchableOpacity onPress={() => step === 'Date' ? router.back() : setStep(prev => prev === 'OTP' ? 'Phone' : 'Date')} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
      ) : <View style={styles.backButton} />}
      <Text variant="h3" weight="bold">{title}</Text>
      <View style={{ width: 40 }} />
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {step === 'Date' && (
        <View style={styles.stepContainer}>
          {renderHeader(t('booking.title'))}
          <ScrollView contentContainerStyle={[styles.scrollContent, { backgroundColor: colors.background }]}>

            {/* Mock Calendar Header */}
            <View style={[styles.calendarMock, { backgroundColor: colors.background }]}>
              <Text variant="h3" weight="medium" align="center" style={styles.monthLabel}>November 2023</Text>
              <View style={styles.daysRow}>
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                  <Text key={i} variant="caption" color={colors.textSecondary} style={styles.dayCol}>{d}</Text>
                ))}
              </View>
              <View style={[styles.datesGrid, { backgroundColor: colors.background }]}>
                {Array.from({ length: 30 }).map((_, i) => {
                  const day = i + 1;
                  const isSelected = day === 20;
                  return (
                    <TouchableOpacity
                      key={day}
                      style={[styles.dateCell, isSelected && { backgroundColor: colors.primary }]}
                    >
                      <Text
                        color={isSelected ? colors.primaryText : colors.text}
                        weight={isSelected ? 'bold' : 'normal'}
                      >
                        {day}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <Text variant="h3" weight="bold" style={styles.sectionTitle}>Time</Text>
            <View style={styles.timeGrid}>
              {TIME_SLOTS.map(tOption => {
                const isSelected = tOption === selectedTime;
                return (
                  <TouchableOpacity
                    key={tOption}
                    style={[
                      styles.timeSlot,
                      { borderColor: colors.border },
                      isSelected && { backgroundColor: colors.primary, borderColor: colors.primary }
                    ]}
                    onPress={() => setSelectedTime(tOption)}
                  >
                    <Text
                      color={isSelected ? colors.primaryText : colors.text}
                      weight={isSelected ? 'bold' : 'medium'}
                    >
                      {tOption}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Button title={t('booking.continue')} fullWidth onPress={handleNextDate} />
          </View>
        </View>
      )}

      {step === 'Phone' && (
        <Pressable style={styles.stepContainer} onPress={Keyboard.dismiss}>
          {renderHeader(t('booking.phone_title'))}
          <View style={styles.contentPad}>
            <Text variant="body" color={colors.textSecondary} style={styles.instructions}>
              Please enter your phone number to proceed with the booking.
            </Text>
            <Input
              value={phone}
              onChangeText={setPhone}
              placeholder={t('booking.phone_placeholder')}
              keyboardType="phone-pad"
              autoFocus
            />
          </View>
          <View style={styles.footerSpace}>
            <Button title={t('booking.continue')} fullWidth onPress={handleNextPhone} disabled={phone.length < 6} />
          </View>
        </Pressable>
      )}

      {step === 'OTP' && (
        <Pressable onPress={Keyboard.dismiss} style={styles.stepContainer}>
          {renderHeader(t('booking.otp_title'))}
          <View style={styles.contentPad}>
            <Text variant="body" color={colors.textSecondary} style={styles.instructions}>
              We've sent a 4-digit code to {phone}. Enter it below.
            </Text>
            <View style={styles.otpContainer}>
              <TextInput
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                maxLength={4}
                style={[styles.otpInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
                autoFocus
              />
            </View>
          </View>
          <View style={styles.footerSpace}>
            <Button
              title={t('booking.verify')}
              fullWidth
              onPress={handleVerifyOtp}
              disabled={otp.length !== 4}
              loading={loading}
            />
          </View>
        </Pressable>
      )}

      {step === 'Success' && (
        <View style={[styles.stepContainer, styles.centerAll]}>
          <View style={[styles.successCircle, { backgroundColor: '#10B981' }]}>
            <Ionicons name="checkmark" size={64} color="#FFF" />
          </View>
          <Text variant="h1" weight="bold" style={styles.successTitle} align="center">
            {t('booking.success_title')}
          </Text>
          <Text variant="body" color={colors.textSecondary} align="center" style={styles.successSub}>
            {t('booking.success_subtitle')}
          </Text>

          <View style={styles.successFooter}>
            <Button title={t('booking.go_to_appointments')} fullWidth onPress={handleFinish} />
          </View>
        </View>
      )}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  stepContainer: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  calendarMock: {
    padding: 16,
    backgroundColor: '#FFF',
    marginBottom: 16,
  },
  monthLabel: {
    marginBottom: 16,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    marginHorizontal: 7,
  },
  dayCol: {
    width: 40,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 14
  },
  datesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  dateCell: {
    width: '14.28%',
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    marginBottom: 8,
  },
  sectionTitle: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
  },
  timeSlot: {
    width: '30%',
    margin: '1.5%',
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  contentPad: {
    padding: 24,
    flex: 1,
  },
  instructions: {
    marginBottom: 24,
    lineHeight: 22,
  },
  footerSpace: {
    padding: 24,
    paddingBottom: 48,
  },
  otpContainer: {
    alignItems: 'center',
  },
  otpInput: {
    fontSize: 32,
    letterSpacing: 24,
    textAlign: 'center',
    width: 200,
    height: 60,
    borderBottomWidth: 2,
  },
  centerAll: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  successCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  successTitle: {
    marginBottom: 16,
  },
  successSub: {
    marginBottom: 48,
  },
  successFooter: {
    width: '100%',
  }
});
