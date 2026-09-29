import { useState } from "react";
import { Text, View, KeyboardAvoidingView, ScrollView } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@components/button";
import { Icon } from "@components/icon";
import { Input } from "@components/input";
import { useAuthStore, AuthError } from "@stores/use-auth-store";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

const Login = () => {
  const login = useAuthStore((s) => s.login);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const onSubmit = (data: LoginForm) => {
    setIsLoading(true);
    setError(null);

    try {
      login(data.username, data.password);
    } catch (e) {
      if (e instanceof AuthError) {
        setError(e.message);
      } else {
        setError("Something went wrong");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={process.env.EXPO_OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-background"
    >
      <ScrollView
        contentContainerClassName="flex-1 justify-center px-6 py-12"
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
      >
        <View className="rounded-lg border border-border bg-card p-6 shadow-sm" style={{ borderCurve: "continuous" }}>
          <View className="mb-6 items-center">
            <View className="mb-3 h-12 w-12 items-center justify-center rounded-lg bg-primary">
              <Icon color="#F8FAFC" name="lock-outline" size={24} />
            </View>
            <Text className="text-2xl font-bold text-foreground">Welcome Back</Text>
            <Text className="mt-1 text-sm text-muted-foreground">Sign in to continue</Text>
          </View>

          {error ? (
            <View className="mb-4 rounded-md bg-destructive/10 px-3 py-2">
              <Text className="text-sm text-destructive">{error}</Text>
            </View>
          ) : null}

          <View className="gap-4">
            <Controller
              control={control}
              name="username"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  autoCapitalize="none"
                  autoCorrect={false}
                  error={errors.username?.message}
                  label="Username"
                  placeholder="Enter your username"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  secureTextEntry
                  autoCapitalize="none"
                  error={errors.password?.message}
                  label="Password"
                  placeholder="Enter your password"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                />
              )}
            />

            <Button className="mt-2" loading={isLoading} onPress={handleSubmit(onSubmit)}>
              Sign In
            </Button>
          </View>
        </View>

        <View className="mt-4 rounded-lg border border-border bg-secondary/50 p-4">
          <Text className="text-center text-xs font-medium text-muted-foreground">
            Demo credentials: demo / password
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Login;
