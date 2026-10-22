import { supabase } from './supabase';

export type AdminUser = {
  id: string;
  email: string;
  full_name: string | null;
  role: 'student' | 'teacher' | 'admin';
  created_at: string;
};

export type AdminAttendance = {
  id: string;
  student_id: string;
  student_name: string | null;
  student_email: string | null;
  event_id: string;
  event_title: string;
  teacher_id: string | null;
  teacher_name: string | null;
  scanned_at: string;
};

export async function getAdminUsers(): Promise<{ data: AdminUser[]; error: string | null }> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, created_at')
    .order('created_at', { ascending: false });
  return { data: (data ?? []) as AdminUser[], error: error?.message ?? null };
}

export async function getAdminAttendance(): Promise<{ data: AdminAttendance[]; error: string | null }> {
  const { data: attendance, error } = await supabase
    .from('attendance')
    .select('id, student_id, event_id, scanned_at, events(title, created_by)')
    .order('scanned_at', { ascending: false });

  if (error) return { data: [], error: error.message };
  const rows = attendance ?? [];
  const studentIds = [...new Set(rows.map((row: any) => row.student_id as string))];
  const teacherIds = [...new Set(rows.map((row: any) => row.events?.created_by as string | null).filter((id): id is string => Boolean(id)))];
  const profileIds = [...new Set([...studentIds, ...teacherIds])];
  let profileMap: Record<string, { name: string | null; email: string | null }> = {};

  if (profileIds.length) {
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .in('id', profileIds);
    if (profileError) return { data: [], error: profileError.message };
    for (const profile of profiles ?? []) {
      profileMap[profile.id] = { name: profile.full_name, email: profile.email };
    }
  }

  return {
    data: rows.map((row: any) => ({
      id: row.id,
      student_id: row.student_id,
      student_name: profileMap[row.student_id]?.name ?? null,
      student_email: profileMap[row.student_id]?.email ?? null,
      event_id: row.event_id,
      event_title: row.events?.title ?? 'Unknown event',
      teacher_id: row.events?.created_by ?? null,
      teacher_name: profileMap[row.events?.created_by]?.name ?? null,
      scanned_at: row.scanned_at,
    })),
    error: null,
  };
}

export async function getAdminSummary() {
  const [usersResult, attendanceResult] = await Promise.all([
    supabase.from('profiles').select('id, role', { count: 'exact' }),
    supabase.from('attendance').select('id', { count: 'exact', head: true }),
  ]);
  return {
    users: usersResult.data ?? [],
    userCount: usersResult.count ?? 0,
    attendanceCount: attendanceResult.count ?? 0,
    error: usersResult.error?.message ?? attendanceResult.error?.message ?? null,
  };
}
