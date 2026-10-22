import { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { COLORS } from '@/constants/colors';
import { getAdminUsers, type AdminUser } from '@/lib/admin';

export default function UsersScreen() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'student' | 'teacher' | 'admin'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(useCallback(() => {
    let active = true;
    setLoading(true);
    getAdminUsers().then((result) => {
      if (!active) return;
      setUsers(result.data);
      setError(result.error);
      setLoading(false);
    });
    return () => { active = false; };
  }, []));

  const filtered = useMemo(() => users.filter((user) => {
    const matchesRole = filter === 'all' || user.role === filter;
    const query = search.trim().toLowerCase();
    const matchesSearch = !query || (user.full_name ?? '').toLowerCase().includes(query) || user.email.toLowerCase().includes(query);
    return matchesRole && matchesSearch;
  }), [users, search, filter]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registered Users</Text>
      <TextInput style={styles.input} value={search} onChangeText={setSearch} placeholder="Search name or email" placeholderTextColor={COLORS.textSecondary} />
      <View style={styles.filters}>
        {(['all', 'student', 'teacher', 'admin'] as const).map((item) => (
          <Text key={item} onPress={() => setFilter(item)} style={[styles.filter, filter === item && styles.activeFilter]}>{item === 'all' ? 'All' : item[0].toUpperCase() + item.slice(1)}</Text>
        ))}
      </View>
      {loading ? <ActivityIndicator color={COLORS.primary} /> : error ? <Text style={styles.error}>{error}</Text> : (
        <FlatList data={filtered} keyExtractor={(item) => item.id} contentContainerStyle={styles.list} ListEmptyComponent={<Text style={styles.empty}>No matching users found.</Text>} renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.full_name || 'Name not provided'}</Text>
            <Text style={styles.meta}>{item.email}</Text>
            <Text style={styles.role}>{item.role.toUpperCase()}</Text>
            <Text style={styles.meta}>Registered: {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Unavailable'}</Text>
            <Text style={styles.meta}>ID: {item.id}</Text>
          </View>
        )} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 20, paddingTop: 24 },
  title: { fontSize: 22, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 14 },
  input: { backgroundColor: COLORS.card, borderColor: COLORS.border, borderWidth: 1, borderRadius: 10, padding: 12, color: COLORS.textPrimary, marginBottom: 10 },
  filters: { flexDirection: 'row', gap: 8, marginBottom: 14, flexWrap: 'wrap' },
  filter: { color: COLORS.textSecondary, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, paddingVertical: 7, paddingHorizontal: 11, borderRadius: 20, overflow: 'hidden' },
  activeFilter: { color: COLORS.textOnPrimary, backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  list: { paddingBottom: 20 },
  card: { backgroundColor: COLORS.card, borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border },
  name: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary },
  meta: { color: COLORS.textSecondary, fontSize: 12, marginTop: 4 },
  role: { alignSelf: 'flex-start', marginTop: 7, paddingVertical: 3, paddingHorizontal: 8, overflow: 'hidden', borderRadius: 10, backgroundColor: COLORS.surface, color: COLORS.primary, fontSize: 11, fontWeight: '700' },
  empty: { color: COLORS.textSecondary, textAlign: 'center', marginTop: 30 },
  error: { color: '#C62828' },
});
