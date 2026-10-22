import { useState } from 'react';
import { Alert, ScrollView, Share, StyleSheet, Text, TextInput, View } from 'react-native';
import AppButton from '@/components/AppButton';
import { COLORS } from '@/constants/colors';
import { getAdminAttendance, type AdminAttendance } from '@/lib/admin';

export default function AnalyticsScreen() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterText, setFilterText] = useState('');
  const [records, setRecords] = useState<AdminAttendance[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    setLoading(true);
    setError(null);
    const result = await getAdminAttendance();
    setLoading(false);
    if (result.error) {
      setError(result.error);
      setRecords(null);
      return;
    }
    const start = startDate.trim() ? new Date(`${startDate.trim()}T00:00:00`) : null;
    const end = endDate.trim() ? new Date(`${endDate.trim()}T23:59:59.999`) : null;
    if ((start && Number.isNaN(start.getTime())) || (end && Number.isNaN(end.getTime()))) {
      setError('Enter dates in YYYY-MM-DD format.');
      setRecords(null);
      return;
    }
    if (start && end && start > end) {
      setError('Start date must be on or before the end date.');
      setRecords(null);
      return;
    }
    const query = filterText.trim().toLowerCase();
    setRecords(result.data.filter((item) => {
      const date = new Date(item.scanned_at).getTime();
      const inRange = (!start || date >= start.getTime()) && (!end || date <= end.getTime());
      const matchesFilter = !query || item.event_title.toLowerCase().includes(query) || (item.student_name ?? '').toLowerCase().includes(query) || (item.student_email ?? '').toLowerCase().includes(query) || (item.teacher_id ?? '').toLowerCase().includes(query) || (item.teacher_name ?? '').toLowerCase().includes(query);
      return inRange && matchesFilter;
    }));
  };

  const shareReport = async () => {
    if (!records) return;
    const lines = [
      'QR-ATT Attendance Report',
      `Date range: ${startDate || 'All time'} to ${endDate || 'All time'}`,
      `Additional filter: ${filterText || 'None'}`,
      `Total attendance entries: ${records.length}`,
      `Unique students: ${new Set(records.map((item) => item.student_id)).size}`,
      `Events with attendance: ${new Set(records.map((item) => item.event_id)).size}`,
      '',
      ...records.map((item) => `${new Date(item.scanned_at).toLocaleString()} | ${item.student_name || item.student_email || item.student_id} | ${item.event_title} | ${item.teacher_name || item.teacher_id || 'Teacher unavailable'}`),
    ];
    try { await Share.share({ title: 'QR-ATT Attendance Report', message: lines.join('\n') }); }
    catch { Alert.alert('Unable to share report', 'Please try again.'); }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Attendance Analytics</Text>
      <Text style={styles.subtitle}>Choose an optional date range, then generate the report when you need it. Use YYYY-MM-DD.</Text>
      <Text style={styles.label}>Start date</Text>
      <TextInput style={styles.input} value={startDate} onChangeText={setStartDate} placeholder="2026-10-01" placeholderTextColor={COLORS.textSecondary} autoCapitalize="none" />
      <Text style={styles.label}>End date</Text>
      <TextInput style={styles.input} value={endDate} onChangeText={setEndDate} placeholder="2026-10-31" placeholderTextColor={COLORS.textSecondary} autoCapitalize="none" />
      <Text style={styles.label}>Optional student, event, or teacher ID filter</Text>
      <TextInput style={styles.input} value={filterText} onChangeText={setFilterText} placeholder="Search report records" placeholderTextColor={COLORS.textSecondary} />
      <AppButton theme="primary" title={loading ? 'Generating...' : 'Generate Report'} icon="bar-chart-outline" onPress={generate} />
      {error && <Text style={styles.error}>{error}</Text>}
      {records && (
        <View style={styles.report}>
          <Text style={styles.reportTitle}>Generated Report</Text>
          <Metric label="Attendance entries" value={records.length} />
          <Metric label="Unique students" value={new Set(records.map((item) => item.student_id)).size} />
          <Metric label="Events with attendance" value={new Set(records.map((item) => item.event_id)).size} />
          <Text style={styles.note}>These are attendance-entry counts, not attendance rates. The current schema does not contain a class roster or total eligible-student count to calculate reliable attendance percentages.</Text>
          <AppButton title="Export / Share Report" icon="share-outline" onPress={shareReport} />
          <Text style={styles.section}>Event summaries</Text>
          {[...records.reduce((map, item) => map.set(item.event_title, (map.get(item.event_title) ?? 0) + 1), new Map<string, number>())].map(([title, count]) => {
            const maxCount = Math.max(1, ...[...records.reduce((map, item) => map.set(item.event_title, (map.get(item.event_title) ?? 0) + 1), new Map<string, number>()).values()]);
            return (
              <View key={title} style={styles.eventRow}>
                <View style={styles.eventInfo}><Text style={styles.eventName}>{title}</Text><View style={styles.barTrack}><View style={[styles.barFill, { width: `${(count / maxCount) * 100}%` as `${number}%` }]} /></View></View>
                <Text style={styles.eventCount}>{count}</Text>
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return <View style={styles.metric}><Text style={styles.metricValue}>{value}</Text><Text style={styles.metricLabel}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, paddingTop: 24, paddingBottom: 32 },
  title: { fontSize: 22, fontWeight: '700', color: COLORS.textPrimary },
  subtitle: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 19, marginTop: 7, marginBottom: 18 },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 5 },
  input: { backgroundColor: COLORS.card, borderColor: COLORS.border, borderWidth: 1, borderRadius: 10, padding: 12, color: COLORS.textPrimary, marginBottom: 12 },
  error: { color: '#C62828', marginTop: 10 },
  report: { backgroundColor: COLORS.card, borderRadius: 14, padding: 16, marginTop: 20, borderWidth: 1, borderColor: COLORS.border },
  reportTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 12 },
  metric: { backgroundColor: COLORS.background, padding: 12, borderRadius: 10, marginBottom: 8 },
  metricValue: { fontSize: 22, fontWeight: '700', color: COLORS.primary },
  metricLabel: { fontSize: 12, color: COLORS.textSecondary, marginTop: 3 },
  note: { fontSize: 12, lineHeight: 18, color: COLORS.textSecondary, marginVertical: 12 },
  section: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary, marginTop: 20, marginBottom: 8 },
  eventRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  eventInfo: { flex: 1, marginRight: 10 },
  eventName: { color: COLORS.textPrimary, marginBottom: 6 },
  barTrack: { height: 7, borderRadius: 6, backgroundColor: COLORS.surface, overflow: 'hidden' },
  barFill: { height: 7, borderRadius: 6, backgroundColor: COLORS.primary },
  eventCount: { color: COLORS.primary, fontWeight: '700' },
});
