
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
import { COLORS } from '@/constants/colors';
import { signIn } from '@/lib/auth';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberEmail, setRememberEmail] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    Keyboard.dismiss();
    setError(null);

    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setLoading(true);

    try {
      const { error: authError } = await signIn(
        email.trim(),
        password
      );

      if (authError) {
        setError(authError.message);
      } else {
        router.replace('/(tabs)');
      }
    } catch (err: any) {
      setError(err?.message || 'Unable to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
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

            <View style={styles.content}>
              <View style={styles.brandIcon}>
                <Ionicons name="qr-code-outline" size={34} color="#FFFFFF" />
              </View>

              <Text style={styles.title}>Welcome back</Text>
              <Text style={styles.subtitle}>
                Sign in to manage and record your attendance.
              </Text>

              <View style={styles.form}>
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
                    placeholder="Enter your password"
                    placeholderTextColor="#888888"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoComplete="current-password"
                    editable={!loading}
                    returnKeyType="done"
                    onSubmitEditing={handleLogin}
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

                <View style={styles.optionsRow}>
                  <Pressable
                    style={styles.rememberRow}
                    onPress={() => setRememberEmail((value) => !value)}
                    disabled={loading}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: rememberEmail }}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        rememberEmail && styles.checkboxChecked,
                      ]}
                    >
                      {rememberEmail && (
                        <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                      )}
                    </View>
                    <Text style={styles.rememberText}>Remember email</Text>
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
                      title="Sign In"
                      icon="log-in-outline"
                      onPress={handleLogin}
                    />
                  )}
                </View>
              </View>

              <View style={styles.dividerRow}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>NEW TO QR ATTENDANCE?</Text>
                <View style={styles.divider} />
              </View>

              <Link href="/register" style={styles.registerButton}>
                <Text style={styles.registerButtonText}>
                  Create an account
                </Text>
                <Ionicons name="arrow-forward" size={18} color="#111111" />
              </Link>

              <View style={styles.securityNote}>
                <Ionicons name="shield-checkmark-outline" size={17} color="#777777" />
                <Text style={styles.securityText}>
                  Sign in securely with your registered account.
                </Text>
              </View>
            </View>

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
    marginBottom: 30,
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
    marginBottom: 22,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.8,
    textAlign: 'center',
    color: '#111111',
  },
  subtitle: {
    fontSize: 14,
    color: '#707070',
    textAlign: 'center',
    lineHeight: 21,
    marginTop: 9,
    marginBottom: 28,
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
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#DADADA',
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    color: '#111111',
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 18,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderColor: '#AAAAAA',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#111111',
    borderColor: '#111111',
  },
  rememberText: {
    fontSize: 12,
    color: '#555555',
  },
  forgotLink: {
    fontSize: 12,
    color: '#111111',
    fontWeight: '700',
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
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 30,
    marginBottom: 18,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E5E5',
  },
  dividerText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    color: '#888888',
  },
  registerButton: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: '#222222',
    borderRadius: 11,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
  },
  registerButtonText: {
    color: '#111111',
    fontSize: 14,
    fontWeight: '700',
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    marginTop: 24,
  },
  securityText: {
    fontSize: 11,
    color: '#777777',
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
    marginTop: 34,
  },
  footerText: {
    fontSize: 11,
    color: '#888888',
    textAlign: 'center',
  },
});
