
import { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
  Pressable,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AppButton from '@/components/AppButton';
import Header from '@/components/Header';
import { signUp } from '@/lib/auth';

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    Keyboard.dismiss();
    setError(null);

    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
      setError('All fields are required.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      const { data, error: authError } = await signUp(
        email.trim(),
        password,
        {
          full_name: fullName.trim(),
          role,
        }
      );

      if (authError) {
        setError(authError.message);
      } else if (data.session) {
        router.replace('/(tabs)');
      } else {
        setSuccess(true);
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <Header title="QR Attendance" />
            </View>

            {success ? (
              <View style={styles.content}>
                <View style={styles.brandIcon}>
                  <Ionicons
                    name="mail-open-outline"
                    size={34}
                    color="#FFFFFF"
                  />
                </View>

                <Text style={styles.title}>Check your email!</Text>
                <Text style={styles.subtitle}>
                  Your account is almost ready.
                </Text>

                <View style={styles.successContainer}>
                  <Text style={styles.successText}>
                    We sent a confirmation link to {email}. Open the link to
                    verify your account, then return to sign in.
                  </Text>
                </View>

                <Link href="/login" style={styles.primaryLink}>
                  Back to Sign In
                </Link>
              </View>
            ) : (
              <View style={styles.content}>
                <View style={styles.brandIcon}>
                  <Ionicons
                    name="person-add-outline"
                    size={32}
                    color="#FFFFFF"
                  />
                </View>

                <Text style={styles.title}>Create account</Text>
                <Text style={styles.subtitle}>
                  Register to start recording your attendance.
                </Text>

                <View style={styles.form}>
                  <Text style={styles.label}>Full name</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons
                      name="person-outline"
                      size={19}
                      color="#777777"
                    />
                    <TextInput
                      style={styles.input}
                      value={fullName}
                      onChangeText={setFullName}
                      placeholder="Enter your full name"
                      placeholderTextColor="#888888"
                      autoCapitalize="words"
                      autoCorrect={false}
                      editable={!loading}
                      returnKeyType="next"
                    />
                  </View>

                  <Text style={styles.label}>I am a...</Text>
                  <View style={styles.roleRow}>
                    <Pressable
                      style={[
                        styles.roleButton,
                        role === 'student' && styles.roleButtonActive,
                      ]}
                      onPress={() => setRole('student')}
                      disabled={loading}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: role === 'student' }}
                    >
                      <Ionicons
                        name="school-outline"
                        size={20}
                        color={role === 'student' ? '#FFFFFF' : '#555555'}
                      />
                      <Text
                        style={[
                          styles.roleText,
                          role === 'student' && styles.roleTextActive,
                        ]}
                      >
                        Student
                      </Text>
                    </Pressable>

                    <Pressable
                      style={[
                        styles.roleButton,
                        role === 'teacher' && styles.roleButtonActive,
                      ]}
                      onPress={() => setRole('teacher')}
                      disabled={loading}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: role === 'teacher' }}
                    >
                      <Ionicons
                        name="easel-outline"
                        size={20}
                        color={role === 'teacher' ? '#FFFFFF' : '#555555'}
                      />
                      <Text
                        style={[
                          styles.roleText,
                          role === 'teacher' && styles.roleTextActive,
                        ]}
                      >
                        Teacher
                      </Text>
                    </Pressable>
                  </View>

                  <Text style={styles.label}>Email address</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons
                      name="mail-outline"
                      size={19}
                      color="#777777"
                    />
                    <TextInput
                      style={styles.input}
                      value={email}
                      onChangeText={setEmail}
                      placeholder="Enter your email"
                      placeholderTextColor="#888888"
                      autoCapitalize="none"
                      autoCorrect={false}
                      keyboardType="email-address"
                      autoComplete="email"
                      editable={!loading}
                      returnKeyType="next"
                    />
                  </View>

                  <Text style={styles.label}>Password</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons
                      name="lock-closed-outline"
                      size={19}
                      color="#777777"
                    />
                    <TextInput
                      style={styles.input}
                      value={password}
                      onChangeText={setPassword}
                      placeholder="At least 6 characters"
                      placeholderTextColor="#888888"
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoComplete="new-password"
                      editable={!loading}
                      returnKeyType="next"
                    />
                    <Pressable
                      onPress={() => setShowPassword((value) => !value)}
                      disabled={loading}
                      hitSlop={10}
                      accessibilityRole="button"
                      accessibilityLabel={
                        showPassword ? 'Hide password' : 'Show password'
                      }
                    >
                      <Ionicons
                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={20}
                        color="#666666"
                      />
                    </Pressable>
                  </View>

                  <Text style={styles.label}>Confirm password</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons
                      name="shield-checkmark-outline"
                      size={19}
                      color="#777777"
                    />
                    <TextInput
                      style={styles.input}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      placeholder="Re-enter your password"
                      placeholderTextColor="#888888"
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                      autoComplete="new-password"
                      editable={!loading}
                      returnKeyType="done"
                      onSubmitEditing={handleRegister}
                    />
                    <Pressable
                      onPress={() =>
                        setShowConfirmPassword((value) => !value)
                      }
                      disabled={loading}
                      hitSlop={10}
                      accessibilityRole="button"
                      accessibilityLabel={
                        showConfirmPassword
                          ? 'Hide confirm password'
                          : 'Show confirm password'
                      }
                    >
                      <Ionicons
                        name={
                          showConfirmPassword
                            ? 'eye-off-outline'
                            : 'eye-outline'
                        }
                        size={20}
                        color="#666666"
                      />
                    </Pressable>
                  </View>

                  {error ? (
                    <View style={styles.errorContainer}>
                      <Ionicons
                        name="alert-circle-outline"
                        size={18}
                        color="#C62828"
                      />
                      <Text style={styles.error} accessibilityRole="alert">
                        {error}
                      </Text>
                    </View>
                  ) : null}

                  <View style={styles.buttonContainer}>
                    {loading ? (
                      <ActivityIndicator size="large" color="#111111" />
                    ) : (
                      <AppButton
                        theme="primary"
                        title="Create Account"
                        icon="person-add-outline"
                        onPress={handleRegister}
                      />
                    )}
                  </View>
                </View>

                <View style={styles.signInRow}>
                  <Text style={styles.signInText}>
                    Already have an account?{' '}
                  </Text>
                  <Link href="/login" style={styles.signInLink}>
                    Sign In
                  </Link>
                </View>

                <View style={styles.securityNote}>
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={16}
                    color="#777777"
                  />
                  <Text style={styles.securityText}>
                    Your account details are handled securely.
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                QR Attendance Management System
              </Text>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 26,
    paddingVertical: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  content: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
  },
  brandIcon: {
    width: 62,
    height: 62,
    borderRadius: 18,
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.8,
    color: '#111111',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#707070',
    lineHeight: 21,
    textAlign: 'center',
    marginTop: 9,
    marginBottom: 22,
  },
  form: {
    width: '100%',
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#222222',
    marginBottom: 8,
    marginTop: 16,
  },
  inputContainer: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#DADADA',
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
  },
  input: {
    flex: 1,
    minHeight: 50,
    fontSize: 14,
    color: '#111111',
  },
  roleRow: {
    flexDirection: 'row',
    gap: 10,
  },
  roleButton: {
    flex: 1,
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#DADADA',
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
  },
  roleButtonActive: {
    backgroundColor: '#111111',
    borderColor: '#111111',
  },
  roleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555555',
  },
  roleTextActive: {
    color: '#FFFFFF',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 14,
    padding: 11,
    borderRadius: 9,
    backgroundColor: '#FFF1F1',
  },
  error: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: '#C62828',
  },
  buttonContainer: {
    marginTop: 26,
  },
  signInRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: 24,
  },
  signInText: {
    fontSize: 13,
    color: '#666666',
  },
  signInLink: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111111',
  },
  securityNote: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 7,
    marginTop: 22,
  },
  securityText: {
    fontSize: 11,
    color: '#777777',
    textAlign: 'center',
  },
  successContainer: {
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E2E2',
    borderRadius: 12,
    marginBottom: 22,
  },
  successText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 22,
    textAlign: 'center',
  },
  primaryLink: {
    color: '#111111',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#222222',
    borderRadius: 11,
  },
  footer: {
    alignItems: 'center',
    marginTop: 30,
  },
  footerText: {
    fontSize: 11,
    color: '#888888',
    textAlign: 'center',
  },
});
