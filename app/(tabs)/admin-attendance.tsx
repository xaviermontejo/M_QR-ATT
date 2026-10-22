import { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { COLORS } from '@/constants/colors';
import { getAdminAttendance, type AdminAttendance } from '@/lib/admin';

export default function AdminAttendanceScreen() {
  const [records, setRecords] = useState<AdminAttendance[]>([]);
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(useCallback(() => {
    let active = true;
    setLoading(true);
    getAdminAttendance().then((result) => {
      if (!active) return;
      setRecords(result.data);
      setError(result.error);
      setLoading(false);
    });
    return () => { active = false; };
  }, []));

  const filtered = useMemo(() => records.filter((record) => {
    const q = search.trim().toLowerCase();
    const matchesSearch = !q || record.student_name?.toLowerCase().includes(q) || record.student_email?.toLowerCase().includes(q) || record.event_title.toLowerCase().includes(q) || record.teacher_name?.toLowerCase().includes(q);
    const matchesDate = !dateFilter.trim() || record.scanned_at.slice(0, 10).includes(dateFilter.trim());
    return Boolean(matchesSearch) && matchesDate;
  }), [records, search, dateFilter]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Attendance Monitoring</Text>
      <Text style={styles.subtitle}>{records.length} attendance record(s) loaded</Text>
      <TextInput style={styles.input} value={search} onChangeText={setSearch} placeholder="Search student, email, or event" placeholderTextColor={COLORS.textSecondary} />
      <TextInput style={styles.input} value={dateFilter} onChangeText={setDateFilter} placeholder="Optional date filter (YYYY-MM-DD)" placeholderTextColor={COLORS.textSecondary} />
      {loading ? <ActivityIndicator color={COLORS.primary} /> : error ? <Text style={styles.error}>{error}</Text> : (
        <FlatList data={filtered} keyExtractor={(item) => item.id} contentContainerStyle={styles.list} ListEmptyComponent={<Text style={styles.empty}>No matching attendance records.</Text>} renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.event}>{item.event_title}</Text>
            <Text style={styles.name}>{item.student_name || 'Name unavailable'}</Text>
            {!!item.student_email && <Text style={styles.meta}>{item.student_email}</Text>}
            {item.teacher_name && <Text style={styles.meta}>Teacher: {item.teacher_name}</Text>}
            <Text style={styles.meta}>Scanned: {new Date(item.scanned_at).toLocaleString()}</Text>
            <Text style={styles.meta}>Student ID: {item.student_id}</Text>
          </View>
        )} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 20, paddingTop: 24 },
  title: { fontSize: 22, fontWeight: '700', color: COLORS.textPrimary },
  subtitle: { fontSize: 13, color: COLORS.textSecondary, marginTop: 5, marginBottom: 12 },
  input: { backgroundColor: COLORS.card, borderColor: COLORS.border, borderWidth: 1, borderRadius: 10, padding: 12, color: COLORS.textPrimary, marginBottom: 9 },
  list: { paddingBottom: 20 },
  card: { backgroundColor: COLORS.card, borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border },
  event: { color: COLORS.primary, fontSize: 16, fontWeight: '700' },
  name: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '600', marginTop: 6 },
  meta: { color: COLORS.textSecondary, fontSize: 12, marginTop: 4 },
  empty: { color: COLORS.textSecondary, textAlign: 'center', marginTop: 30 },
  error: { color: '#C62828' },
});
