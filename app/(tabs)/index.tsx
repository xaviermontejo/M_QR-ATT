import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useFocusEffect } from 'expo-router';

import AppButton from '@/components/AppButton';
import Header from '@/components/Header';
import { COLORS } from '@/constants/colors';
import { useAuth } from '@/lib/auth';
import { useRole } from '@/lib/profiles';
import { getAdminSummary } from '@/lib/admin';

export default function Index() {
  const { user } = useAuth();
  const { role, loading: roleLoading } = useRole(user?.id);
  const [summary, setSummary] = useState({ userCount: 0, studentCount: 0, teacherCount: 0, attendanceCount: 0 });
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  useFocusEffect(useCallback(() => {
    let active = true;
    if (role !== 'admin') return () => { active = false; };
    setSummaryLoading(true);
    getAdminSummary().then((result) => {
      if (!active) return;
      setSummaryError(result.error);
      setSummary({
        userCount: result.userCount,
        studentCount: result.users.filter((item: any) => item.role === 'student').length,
        teacherCount: result.users.filter((item: any) => item.role === 'teacher').length,
        attendanceCount: result.attendanceCount,
      });
      setSummaryLoading(false);
    });
    return () => { active = false; };
  }, [role]));

  if (roleLoading) {
    return <View style={styles.loading}><ActivityIndicator color={COLORS.primary} size="large" /></View>;
  }

  if (role === 'admin') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.adminContent}>
          <Header title="Admin Dashboard" />
          <Text style={styles.adminSubtitle}>Manage users and review attendance from one place.</Text>
          {summaryLoading ? <ActivityIndicator color={COLORS.primary} /> : (
            <View style={styles.statsGrid}>
              <StatCard label="Registered users" value={summary.userCount} />
              <StatCard label="Students" value={summary.studentCount} />
              <StatCard label="Teachers" value={summary.teacherCount} />
              <StatCard label="Attendance records" value={summary.attendanceCount} />
            </View>
          )}
          {summaryError && <Text style={styles.error}>{summaryError}</Text>}
          <Text style={styles.sectionTitle}>Administration</Text>
          <AppButton theme="primary" title="Registered User Management" icon="people-outline" onPress={() => router.push('/users')} />
          <AppButton title="Attendance Monitoring" icon="list-outline" onPress={() => router.push('/admin-attendance')} />
          <AppButton title="Attendance Analytics & Reports" icon="bar-chart-outline" onPress={() => router.push('/analytics')} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Header title="QR Attendance" />
        <Text>by: Xavier Francis Montejo</Text>
      </View>
      <View style={styles.bodyContainer}>
        <Text style={styles.mainTitle}>School Event Attendance</Text>
        <Text style={styles.subtitle}>Scan QR Codes to record attendance during school activities.</Text>
      </View>
      <View style={styles.footerContainer}>
        {role !== 'teacher' && <AppButton theme="primary" title="Scan QR Code" icon="qr-code-outline" onPress={() => router.push('/scan')} />}
        <AppButton title="Attendance History" icon="time-outline" onPress={() => router.push('/history')} />
        <AppButton title="Profile" icon="person-outline" onPress={() => router.push('/profile')} />
      </View>
    </SafeAreaView>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background },
  headerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  bodyContainer: { alignItems: 'center', paddingHorizontal: 32, marginBottom: 16 },
  mainTitle: { fontSize: 18, fontWeight: '600', color: COLORS.primary, marginBottom: 6, textAlign: 'center' },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center' },
  footerContainer: { flex: 1 / 3, alignItems: 'center', paddingHorizontal: 24, width: '100%' },
  adminContent: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 28 },
  adminSubtitle: { color: COLORS.textSecondary, marginTop: 6, marginBottom: 20, fontSize: 14 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  statCard: { width: '48%', flexGrow: 1, backgroundColor: COLORS.card, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: COLORS.border },
  statValue: { color: COLORS.primary, fontSize: 25, fontWeight: '700' },
  statLabel: { color: COLORS.textSecondary, fontSize: 12, marginTop: 5 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 12 },
  error: { color: '#C62828', marginBottom: 12 },
});
