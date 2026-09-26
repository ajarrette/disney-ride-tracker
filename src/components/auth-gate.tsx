import { useEffect, useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Session } from '@supabase/supabase-js';

import { Colors, Fonts } from '@/constants/theme';
import { supabase } from '@/data/supabase';

export function AuthGate({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(Boolean(supabase));

  useEffect(() => {
    if (!supabase) return;

    let isMounted = true;
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!isMounted) return;
      setSession(nextSession);
      setIsCheckingSession(false);
    });

    void supabase.auth
      .getSession()
      .then(({ data: sessionData }) => {
        if (!isMounted) return;
        setSession(sessionData.session);
        setIsCheckingSession(false);
      })
      .catch(() => {
        if (!isMounted) return;
        setSession(null);
        setIsCheckingSession(false);
      });

    return () => {
      isMounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  if (isCheckingSession) return <LoadingScreen />;
  if (!supabase || !session) return <EmailSignInScreen />;
  return children;
}

function LoadingScreen() {
  return (
    <View style={styles.loadingScreen}>
      <ActivityIndicator color={Colors.light.accent} />
    </View>
  );
}

function EmailSignInScreen() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const colors = Colors.light;

  const sendCode = async () => {
    if (!supabase) {
      setErrorMessage('Sign-in is not configured. Please try again later.');
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setErrorMessage('Enter your email address to continue.');
      return;
    }

    setIsBusy(true);
    setErrorMessage(null);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: normalizedEmail,
        options: { shouldCreateUser: true },
      });
      if (error) throw error;
      setEmail(normalizedEmail);
      setSentTo(normalizedEmail);
      setCode('');
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Unable to send a sign-in code. Please try again.',
      );
    } finally {
      setIsBusy(false);
    }
  };

  const verifyCode = async () => {
    if (!supabase || !sentTo) return;
    const token = code.replace(/\D/g, '');
    if (token.length < 6 || token.length > 10) {
      setErrorMessage('Enter the complete code from your email.');
      return;
    }

    setIsBusy(true);
    setErrorMessage(null);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: sentTo,
        token,
        type: 'email',
      });
      if (error) throw error;
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'That code could not be verified. Please try again.',
      );
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.screen, { backgroundColor: colors.background }]}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 36, paddingBottom: insets.bottom + 36 },
        ]}
        keyboardShouldPersistTaps='handled'
      >
        <View style={styles.form}>
          <Text style={[styles.eyebrow, { color: colors.accent }]}>
            DISNEY RIDE TRACKER
          </Text>
          <Text style={[styles.title, { color: colors.text }]}>
            Your park diary, together.
          </Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            Sign in with your email. No password to remember.
          </Text>

          {sentTo ? (
            <>
              <Text style={[styles.fieldLabel, { color: colors.text }]}>
                Email code
              </Text>
              <Text style={[styles.hint, { color: colors.textSecondary }]}>
                We sent a code to {sentTo}.
              </Text>
              <TextInput
                accessibilityLabel='Email verification code'
                autoComplete='one-time-code'
                autoFocus
                autoCapitalize='none'
                keyboardType='number-pad'
                maxLength={10}
                onChangeText={(value) => setCode(value.replace(/\D/g, ''))}
                onSubmitEditing={verifyCode}
                placeholder='Enter code'
                placeholderTextColor={colors.textSecondary}
                returnKeyType='done'
                style={[
                  styles.input,
                  styles.codeInput,
                  {
                    backgroundColor: colors.backgroundElement,
                    borderColor: colors.backgroundSelected,
                    color: colors.text,
                  },
                ]}
                textContentType='oneTimeCode'
                value={code}
              />
              <PrimaryButton
                title='Verify code'
                disabled={isBusy}
                onPress={verifyCode}
              />
              <Pressable
                accessibilityRole='button'
                disabled={isBusy}
                onPress={sendCode}
                style={styles.textButton}
              >
                <Text
                  style={[styles.textButtonLabel, { color: colors.accent }]}
                >
                  Send a new code
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole='button'
                disabled={isBusy}
                onPress={() => {
                  setSentTo(null);
                  setCode('');
                  setErrorMessage(null);
                }}
                style={styles.textButton}
              >
                <Text
                  style={[
                    styles.textButtonLabel,
                    { color: colors.textSecondary },
                  ]}
                >
                  Use a different email
                </Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text style={[styles.fieldLabel, { color: colors.text }]}>
                Email address
              </Text>
              <TextInput
                accessibilityLabel='Email address'
                autoCapitalize='none'
                autoComplete='email'
                keyboardType='email-address'
                onChangeText={setEmail}
                onSubmitEditing={sendCode}
                placeholder='you@example.com'
                placeholderTextColor={colors.textSecondary}
                returnKeyType='send'
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.backgroundElement,
                    borderColor: colors.backgroundSelected,
                    color: colors.text,
                  },
                ]}
                textContentType='emailAddress'
                value={email}
              />
              <PrimaryButton
                title='Send sign-in code'
                disabled={isBusy}
                onPress={sendCode}
              />
            </>
          )}

          {isBusy && (
            <ActivityIndicator color={colors.accent} style={styles.progress} />
          )}
          {errorMessage && (
            <Text accessibilityRole='alert' style={styles.error}>
              {errorMessage}
            </Text>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function PrimaryButton({
  title,
  disabled,
  onPress,
}: {
  title: string;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole='button'
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.primaryButton,
        (pressed || disabled) && styles.primaryButtonDimmed,
      ]}
    >
      <Text style={styles.primaryButtonLabel}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    alignItems: 'center',
    backgroundColor: Colors.light.background,
    flex: 1,
    justifyContent: 'center',
  },
  screen: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  form: {
    alignSelf: 'center',
    maxWidth: 440,
    width: '100%',
  },
  eyebrow: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 12,
  },
  title: {
    fontFamily: Fonts.sans,
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 39,
  },
  description: {
    fontFamily: Fonts.sans,
    fontSize: 16,
    lineHeight: 23,
    marginBottom: 32,
    marginTop: 10,
  },
  fieldLabel: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  hint: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  input: {
    borderRadius: 8,
    borderWidth: 1,
    fontFamily: Fonts.sans,
    fontSize: 16,
    minHeight: 54,
    paddingHorizontal: 14,
  },
  codeInput: {
    fontSize: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: Colors.light.accent,
    borderRadius: 8,
    justifyContent: 'center',
    marginTop: 16,
    minHeight: 52,
    paddingHorizontal: 16,
  },
  primaryButtonDimmed: {
    opacity: 0.55,
  },
  primaryButtonLabel: {
    color: '#ffffff',
    fontFamily: Fonts.sans,
    fontSize: 16,
    fontWeight: '600',
  },
  textButton: {
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
    marginTop: 4,
  },
  textButtonLabel: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: '600',
  },
  progress: {
    marginTop: 14,
  },
  error: {
    color: '#B42318',
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 14,
  },
});
