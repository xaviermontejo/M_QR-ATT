import { Redirect, Stack, useSegments } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useEffect, useState } from 'react';

import { COLORS } from '@/constants/colors';
import { useAuth } from '@/lib/auth';
import { getProfile, type Role } from '@/lib/profiles';

const ADMIN_ROUTES = new Set(['index', 'profile', 'users', 'admin-attendance', 'analytics']);
const TEACHER_ROUTES = new Set(['index', 'history', 'profile', 'teacher']);
const STUDENT_ROUTES = new Set(['index', 'scan', 'history', 'profile', 'teacher']);

export default function RootLayout() {
  const { session, user, loading } = useAuth();
  const segments = useSegments();
  const [role, setRole] = useState<Role | null>(null);
  const [roleUserId, setRoleUserId] = useState<string | null>(null);
  const [roleLoading, setRoleLoading] = useState(true);

  useEffect(() => {
    let active = true;
    if (!user?.id) {
      setRole(null);
      setRoleUserId(null);
      setRoleLoading(false);
      return () => { active = false; };
    }
    setRoleLoading(true);
    getProfile(user.id).then((profile) => {
      if (!active) return;
      setRole(profile?.role ?? 'student');
      setRoleUserId(user.id);
      setRoleLoading(false);
    });
    return () => { active = false; };
  }, [user?.id]);

  if (loading || (session && (roleLoading || roleUserId !== user?.id))) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const path = segments?.[0];
  const inAuthGroup = path === 'login' || path === 'register';
  const inTabsGroup = path === '(tabs)';
  const screen = inTabsGroup ? String(segments?.[1] ?? 'index') : '';

  if (!session && inTabsGroup) return <Redirect href="/login" />;
  if (session && inAuthGroup) return <Redirect href="/(tabs)" />;

  if (session && inTabsGroup) {
    const allowed = role === 'admin'
      ? ADMIN_ROUTES
      : role === 'teacher'
        ? TEACHER_ROUTES
        : STUDENT_ROUTES;
    if (!allowed.has(screen)) return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
