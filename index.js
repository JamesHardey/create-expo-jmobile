#!/usr/bin/env node
import prompts from "prompts";
import { execa } from "execa";
import fs from "fs-extra";
import path from "path";
import chalk from "chalk";

const run = async () => {
  console.log(chalk.cyan("🚀 Welcome to Modern Expo Boilerplate CLI"));

  const response = await prompts([
    {
      type: "text",
      name: "appName",
      message: "What is your app name?",
      initial: "my-expo-app",
      validate: value => {
        if (value.includes(" ")) {
          return "App name cannot contain spaces. Use hyphens or underscores instead.";
        }
        if (!/^[a-zA-Z0-9-_]+$/.test(value)) {
          return "App name can only contain letters, numbers, hyphens, and underscores.";
        }
        return true;
      }
    },
    {
      type: "select",
      name: "font",
      message: "Choose a default font family",
      choices: [
        { title: "Inter", value: "Inter" },
        { title: "Poppins", value: "Poppins" },
        { title: "Montserrat", value: "Montserrat" },
        { title: "Roboto", value: "Roboto" },
        { title: "Lato", value: "Lato" },
      ],
      initial: 0,
    },
    {
      type: "text",
      name: "primaryColor",
      message: "Enter primary color (hex code, leave empty for default #3B82F6)",
      initial: "",
    },
    {
      type: "text",
      name: "secondaryColor",
      message: "Enter secondary color (hex code, leave empty for default #6B7280)",
      initial: "",
    },
    {
      type: "confirm",
      name: "needsAuth",
      message: "Do you need authentication pages?",
      initial: false,
    },
    {
      type: (prev) => (prev ? "confirm" : null),
      name: "needsBottomTabs",
      message: "Do you want bottom tab navigation for home?",
      initial: true,
    },
  ]);

  const { appName, font, primaryColor, secondaryColor, needsAuth, needsBottomTabs } = response;

  const colors = {
    primary: primaryColor || "#3B82F6",
    secondary: secondaryColor || "#6B7280",
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
    background: "#F9FAFB",
    surface: "#FFFFFF",
    text: "#111827",
    textSecondary: "#6B7280",
    border: "#E5E7EB",
  };

  console.log(chalk.green(`\n✅ Creating Expo App: ${appName} with ${font} font...\n`));

  // Step 1: Create Expo app
  await execa("npx", ["create-expo-app", appName, "--template", "blank-typescript"], {
    stdio: "inherit",
  });

  const appPath = path.join(process.cwd(), appName);
  // Handle spaces in directory name by using quotes
  try {
    process.chdir(appPath);
  } catch (err) {
    console.error(chalk.red(`\n❌ Error: Could not change to directory: ${appPath}`));
    console.error(chalk.red(`Please ensure the app name doesn't contain spaces or special characters.`));
    process.exit(1);
  }

  // Step 2: Install dependencies
  const dependencies = [
    "nativewind",
    "tailwindcss",
    "react-hook-form",
    "expo-font",
    "expo-router",
    "expo-splash-screen",
    "expo-status-bar",
    "react-native-safe-area-context",
    "react-native-screens",
    `expo-google-fonts-${font.toLowerCase()}`
  ];

  await execa("npm", ["install", ...dependencies], { stdio: "inherit" });

  // Step 3: Setup Tailwind config
  const tailwindConfig = `
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./features/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["${font}"],
      },
      colors: {
        primary: "${colors.primary}",
        secondary: "${colors.secondary}",
        success: "${colors.success}",
        warning: "${colors.warning}",
        error: "${colors.error}",
        background: "${colors.background}",
        surface: "${colors.surface}",
        text: "${colors.text}",
        textSecondary: "${colors.textSecondary}",
        border: "${colors.border}",
      },
    },
  },
  plugins: [],
}`;

  fs.writeFileSync(path.join(appPath, "tailwind.config.js"), tailwindConfig);

  // Step 4: Setup app.json for Expo Router
  const appJson = JSON.parse(fs.readFileSync(path.join(appPath, "app.json"), "utf8"));
  appJson.expo.scheme = appName.toLowerCase().replace(/[^a-z0-9]/g, "");
  fs.writeFileSync(path.join(appPath, "app.json"), JSON.stringify(appJson, null, 2));

  // Step 5: Setup Folder Structure
  const folders = ["app", "components/ui", "features", "hooks", "utils", "constants"];
  folders.forEach(f => fs.ensureDirSync(path.join(appPath, f)));

  // Step 6: Create theme and constants
  const themeFile = `
export const theme = {
  colors: {
    primary: "${colors.primary}",
    secondary: "${colors.secondary}",
    success: "${colors.success}",
    warning: "${colors.warning}",
    error: "${colors.error}",
    background: "${colors.background}",
    surface: "${colors.surface}",
    text: "${colors.text}",
    textSecondary: "${colors.textSecondary}",
    border: "${colors.border}",
  },
  fontFamily: "${font}",
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
  },
};

export type Theme = typeof theme;
`;
  fs.writeFileSync(path.join(appPath, "constants", "theme.ts"), themeFile);

  // Step 7: Create reusable components
  const textComponent = `
import React from "react";
import { Text as RNText, TextProps as RNTextProps } from "react-native";
import { theme } from "../constants/theme";

interface TextProps extends RNTextProps {
  variant?: "heading" | "subheading" | "body" | "caption" | "label";
  color?: "primary" | "secondary" | "text" | "textSecondary" | "error" | "success" | "warning";
  weight?: "normal" | "medium" | "semibold" | "bold";
}

const Text: React.FC<TextProps> = ({ 
  variant = "body", 
  color = "text", 
  weight = "normal",
  style,
  className = "",
  ...props 
}) => {
  const getVariantStyle = () => {
    switch (variant) {
      case "heading":
        return "text-3xl font-bold";
      case "subheading":
        return "text-xl font-semibold";
      case "body":
        return "text-base";
      case "caption":
        return "text-sm";
      case "label":
        return "text-sm font-medium";
      default:
        return "text-base";
    }
  };

  const getColorStyle = () => {
    switch (color) {
      case "primary":
        return "text-primary";
      case "secondary":
        return "text-secondary";
      case "error":
        return "text-error";
      case "success":
        return "text-success";
      case "warning":
        return "text-warning";
      case "textSecondary":
        return "text-textSecondary";
      default:
        return "text-text";
    }
  };

  const getWeightStyle = () => {
    switch (weight) {
      case "medium":
        return "font-medium";
      case "semibold":
        return "font-semibold";
      case "bold":
        return "font-bold";
      default:
        return "font-normal";
    }
  };

  const combinedClassName = \`\${getVariantStyle()} \${getColorStyle()} \${getWeightStyle()} \${className}\`;

  return (
    <RNText
      style={[{ fontFamily: theme.fontFamily }, style]}
      className={combinedClassName}
      {...props}
    />
  );
};

export default Text;
`;
  fs.writeFileSync(path.join(appPath, "components/ui", "Text.tsx"), textComponent);

  const buttonComponent = `
import React from "react";
import { TouchableOpacity, TouchableOpacityProps, ActivityIndicator } from "react-native";
import Text from "./Text";

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  title,
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  disabled,
  className = "",
  ...props
}) => {
  const getVariantStyle = () => {
    switch (variant) {
      case "primary":
        return "bg-primary";
      case "secondary":
        return "bg-secondary";
      case "outline":
        return "bg-transparent border-2 border-primary";
      case "ghost":
        return "bg-transparent";
      case "danger":
        return "bg-error";
      default:
        return "bg-primary";
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case "sm":
        return "px-3 py-2 rounded-lg";
      case "md":
        return "px-4 py-3 rounded-xl";
      case "lg":
        return "px-6 py-4 rounded-2xl";
      default:
        return "px-4 py-3 rounded-xl";
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case "outline":
      case "ghost":
        return "primary";
      default:
        return "surface";
    }
  };

  const getTextSize = () => {
    switch (size) {
      case "sm":
        return "caption";
      case "md":
        return "body";
      case "lg":
        return "subheading";
      default:
        return "body";
    }
  };

  const isDisabled = disabled || loading;
  const widthStyle = fullWidth ? "w-full" : "";
  const opacityStyle = isDisabled ? "opacity-50" : "";
  
  const combinedClassName = \`\${getVariantStyle()} \${getSizeStyle()} \${widthStyle} \${opacityStyle} \${className}\`;

  return (
    <TouchableOpacity
      disabled={isDisabled}
      className={combinedClassName}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === "outline" || variant === "ghost" ? colors.primary : colors.surface} />
      ) : (
        <Text variant={getTextSize()} color={getTextColor()} weight="semibold" className="text-center">
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default Button;
`;
  fs.writeFileSync(path.join(appPath, "components/ui", "Button.tsx"), buttonComponent);

  const textFieldComponent = `
import React from "react";
import { Controller, Control, FieldError } from "react-hook-form";
import { TextInput, View, TextInputProps } from "react-native";
import Text from "./Text";

interface TextFieldProps extends TextInputProps {
  control: Control<any>;
  name: string;
  label?: string;
  placeholder?: string;
  error?: FieldError;
  variant?: "default" | "filled" | "outline";
  size?: "sm" | "md" | "lg";
}

const TextField: React.FC<TextFieldProps> = ({
  control,
  name,
  label,
  placeholder,
  variant = "outline",
  size = "md",
  className = "",
  ...props
}) => {
  const getVariantStyle = () => {
    switch (variant) {
      case "filled":
        return "bg-background border border-border";
      case "outline":
        return "bg-surface border-2 border-border focus:border-primary";
      default:
        return "bg-surface border border-border";
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case "sm":
        return "px-3 py-2 rounded-lg text-sm";
      case "md":
        return "px-4 py-3 rounded-xl text-base";
      case "lg":
        return "px-5 py-4 rounded-2xl text-lg";
      default:
        return "px-4 py-3 rounded-xl text-base";
    }
  };

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
        <View className="mb-4">
          {label && (
            <Text variant="label" color="text" className="mb-2">
              {label}
            </Text>
          )}
          <TextInput
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            placeholderTextColor="#9CA3AF"
            className={\`\${getVariantStyle()} \${getSizeStyle()} \${error ? "border-error" : ""} \${className}\`}
            {...props}
          />
          {error && (
            <Text variant="caption" color="error" className="mt-1">
              {error.message}
            </Text>
          )}
        </View>
      )}
    />
  );
};

export default TextField;
`;
  fs.writeFileSync(path.join(appPath, "components/ui", "TextField.tsx"), textFieldComponent);

  // Step 8: Create layout components
  const safeAreaComponent = `
import React from "react";
import { SafeAreaView, StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

interface SafeAreaLayoutProps {
  children: React.ReactNode;
  className?: string;
  statusBarStyle?: "light" | "dark";
}

const SafeAreaLayout: React.FC<SafeAreaLayoutProps> = ({
  children,
  className = "",
  statusBarStyle = "dark",
}) => {
  return (
    <SafeAreaProvider>
      <SafeAreaView className={\`flex-1 bg-background \${className}\`}>
        <StatusBar barStyle={\`\${statusBarStyle}-content\`} backgroundColor="transparent" translucent />
        {children}
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default SafeAreaLayout;
`;
  fs.writeFileSync(path.join(appPath, "components/ui", "SafeAreaLayout.tsx"), safeAreaComponent);

  const fullScreenComponent = `
import React from "react";
import { View } from "react-native";
import SafeAreaLayout from "./SafeAreaLayout";

interface FullScreenLayoutProps {
  children: React.ReactNode;
  className?: string;
  statusBarStyle?: "light" | "dark";
  safeArea?: boolean;
}

const FullScreenLayout: React.FC<FullScreenLayoutProps> = ({
  children,
  className = "",
  statusBarStyle = "dark",
  safeArea = true,
}) => {
  if (safeArea) {
    return (
      <SafeAreaLayout className={className} statusBarStyle={statusBarStyle}>
        {children}
      </SafeAreaLayout>
    );
  }

  return (
    <View className={\`flex-1 bg-background \${className}\`}>
      {children}
    </View>
  );
};

export default FullScreenLayout;
`;
  fs.writeFileSync(path.join(appPath, "components/ui", "FullScreenLayout.tsx"), fullScreenComponent);

  // Step 9: Create index file for components
  const componentsIndex = `
export { default as Text } from "./Text";
export { default as Button } from "./Button";
export { default as TextField } from "./TextField";
export { default as SafeAreaLayout } from "./SafeAreaLayout";
export { default as FullScreenLayout } from "./FullScreenLayout";
`;
  fs.writeFileSync(path.join(appPath, "components/ui", "index.ts"), componentsIndex);

  // Step 10: Setup app structure based on requirements
  if (needsAuth) {
    // Create auth pages
    const loginPage = `
import React from "react";
import { View } from "react-native";
import { useForm } from "react-hook-form";
import { Link, router } from "expo-router";
import { FullScreenLayout, Text, TextField, Button } from "../../components/ui";

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginPage() {
  const { control, handleSubmit, formState: { errors } } = useForm<LoginForm>();

  const onSubmit = (data: LoginForm) => {
    console.log("Login data:", data);
    // TODO: Implement authentication logic
    router.replace("/(tabs)");
  };

  return (
    <FullScreenLayout>
      <View className="flex-1 justify-center px-6">
        <View className="mb-8">
          <Text variant="heading" className="text-center mb-2">
            Welcome Back
          </Text>
          <Text variant="body" color="textSecondary" className="text-center">
            Sign in to your account
          </Text>
        </View>

        <View className="mb-6">
          <TextField
            control={control}
            name="email"
            label="Email"
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            rules={{ 
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}$/i,
                message: "Invalid email address"
              }
            }}
          />
          
          <TextField
            control={control}
            name="password"
            label="Password"
            placeholder="Enter your password"
            secureTextEntry
            rules={{ 
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters"
              }
            }}
          />
        </View>

        <Button
          title="Sign In"
          onPress={handleSubmit(onSubmit)}
          variant="primary"
          size="lg"
          fullWidth
          className="mb-4"
        />

        <View className="flex-row justify-center">
          <Text variant="body" color="textSecondary">
            Don't have an account?{" "}
          </Text>
          <Link href="/signup" asChild>
            <Text variant="body" color="primary" weight="medium">
              Sign up
            </Text>
          </Link>
        </View>
      </View>
    </FullScreenLayout>
  );
}
`;
    fs.writeFileSync(path.join(appPath, "app", "login.tsx"), loginPage);

    const signupPage = `
import React from "react";
import { View } from "react-native";
import { useForm } from "react-hook-form";
import { Link, router } from "expo-router";
import { FullScreenLayout, Text, TextField, Button } from "../../components/ui";

interface SignupForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function SignupPage() {
  const { control, handleSubmit, watch, formState: { errors } } = useForm<SignupForm>();
  const password = watch("password");

  const onSubmit = (data: SignupForm) => {
    console.log("Signup data:", data);
    // TODO: Implement registration logic
    router.replace("/(tabs)");
  };

  return (
    <FullScreenLayout>
      <View className="flex-1 justify-center px-6">
        <View className="mb-8">
          <Text variant="heading" className="text-center mb-2">
            Create Account
          </Text>
          <Text variant="body" color="textSecondary" className="text-center">
            Join us today
          </Text>
        </View>

        <View className="mb-6">
          <TextField
            control={control}
            name="name"
            label="Full Name"
            placeholder="Enter your full name"
            rules={{ required: "Name is required" }}
          />
          
          <TextField
            control={control}
            name="email"
            label="Email"
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            rules={{ 
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}$/i,
                message: "Invalid email address"
              }
            }}
          />
          
          <TextField
            control={control}
            name="password"
            label="Password"
            placeholder="Enter your password"
            secureTextEntry
            rules={{ 
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters"
              }
            }}
          />

          <TextField
            control={control}
            name="confirmPassword"
            label="Confirm Password"
            placeholder="Confirm your password"
            secureTextEntry
            rules={{ 
              required: "Please confirm your password",
              validate: (value) => value === password || "Passwords do not match"
            }}
          />
        </View>

        <Button
          title="Create Account"
          onPress={handleSubmit(onSubmit)}
          variant="primary"
          size="lg"
          fullWidth
          className="mb-4"
        />

        <View className="flex-row justify-center">
          <Text variant="body" color="textSecondary">
            Already have an account?{" "}
          </Text>
          <Link href="/login" asChild>
            <Text variant="body" color="primary" weight="medium">
              Sign in
            </Text>
          </Link>
        </View>
      </View>
    </FullScreenLayout>
  );
}
`;
    fs.writeFileSync(path.join(appPath, "app", "signup.tsx"), signupPage);
  }

  // Step 11: Create navigation structure
  if (needsBottomTabs) {
    // Create layout for tabs
    const tabsLayout = `
import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../constants/theme";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: "Notifications",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="notifications" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
`;
    fs.ensureDirSync(path.join(appPath, "app", "(tabs)"));
    fs.writeFileSync(path.join(appPath, "app", "(tabs)", "_layout.tsx"), tabsLayout);

    // Create tab screens
    const homeScreen = `
import React from "react";
import { View, ScrollView } from "react-native";
import { FullScreenLayout, Text, Button } from "../../../components/ui";

export default function HomeScreen() {
  return (
    <FullScreenLayout>
      <ScrollView className="flex-1">
        <View className="px-6 pt-6">
          <Text variant="heading" className="mb-2">
            Welcome to ${appName}!
          </Text>
          <Text variant="body" color="textSecondary" className="mb-6">
            Your modern Expo app is ready to go.
          </Text>

          <View className="space-y-4">
            <Button
              title="Get Started"
              variant="primary"
              size="lg"
              fullWidth
              onPress={() => console.log("Get Started pressed")}
            />
            
            <Button
              title="Learn More"
              variant="outline"
              size="md"
              fullWidth
              onPress={() => console.log("Learn More pressed")}
            />
          </View>

          <View className="mt-8 p-4 bg-surface rounded-2xl border border-border">
            <Text variant="subheading" className="mb-2">
              Quick Actions
            </Text>
            <Text variant="body" color="textSecondary">
              This is where you can add your main app functionality.
            </Text>
          </View>
        </View>
      </ScrollView>
    </FullScreenLayout>
  );
}
`;
    fs.writeFileSync(path.join(appPath, "app", "(tabs)", "index.tsx"), homeScreen);

    const exploreScreen = `
import React from "react";
import { View, ScrollView } from "react-native";
import { FullScreenLayout, Text, Button } from "../../../components/ui";

export default function ExploreScreen() {
  return (
    <FullScreenLayout>
      <ScrollView className="flex-1">
        <View className="px-6 pt-6">
          <Text variant="heading" className="mb-6">
            Explore
          </Text>

          <View className="space-y-4">
            {[1, 2, 3, 4].map((item) => (
              <View key={item} className="p-4 bg-surface rounded-2xl border border-border">
                <Text variant="subheading" className="mb-2">
                  Feature {item}
                </Text>
                <Text variant="body" color="textSecondary" className="mb-3">
                  Discover amazing content and features in this section.
                </Text>
                <Button
                  title="Explore"
                  variant="ghost"
                  size="sm"
                  onPress={() => console.log(\`Explore item \${item}\`)}
                />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </FullScreenLayout>
  );
}
`;
    fs.writeFileSync(path.join(appPath, "app", "(tabs)", "explore.tsx"), exploreScreen);

    const notificationsScreen = `
import React from "react";
import { View, ScrollView } from "react-native";
import { FullScreenLayout, Text } from "../../../components/ui";

export default function NotificationsScreen() {
  const notifications = [
    { id: 1, title: "Welcome!", message: "Thanks for using ${appName}", time: "2 min ago" },
    { id: 2, title: "New Feature", message: "Check out our latest update", time: "1 hour ago" },
    { id: 3, title: "Reminder", message: "Don't forget to complete your profile", time: "2 hours ago" },
  ];

  return (
    <FullScreenLayout>
      <ScrollView className="flex-1">
        <View className="px-6 pt-6">
          <Text variant="heading" className="mb-6">
            Notifications
          </Text>

          <View className="space-y-3">
            {notifications.map((notification) => (
              <View key={notification.id} className="p-4 bg-surface rounded-2xl border border-border">
                <View className="flex-row justify-between items-start mb-2">
                  <Text variant="label" className="flex-1">
                    {notification.title}
                  </Text>
                  <Text variant="caption" color="textSecondary">
                    {notification.time}
                  </Text>
                </View>
                <Text variant="body" color="textSecondary">
                  {notification.message}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </FullScreenLayout>
  );
}
`;
    fs.writeFileSync(path.join(appPath, "app", "(tabs)", "notifications.tsx"), notificationsScreen);

    const profileScreen = `
import React from "react";
import { View, ScrollView } from "react-native";
import { FullScreenLayout, Text, Button } from "../../../components/ui";

export default function ProfileScreen() {
  const userInfo = {
    name: "John Doe",
    email: "john.doe@example.com",
    joinDate: "January 2025",
  };

  return (
    <FullScreenLayout>
      <ScrollView className="flex-1">
        <View className="px-6 pt-6">
          <Text variant="heading" className="mb-6">
            Profile
          </Text>

          <View className="p-6 bg-surface rounded-2xl border border-border mb-6">
            <View className="w-20 h-20 bg-primary rounded-full mb-4 items-center justify-center">
              <Text variant="heading" color="surface">
                {userInfo.name.split(" ").map(n => n[0]).join("")}
              </Text>
            </View>
            
            <Text variant="subheading" className="mb-1">
              {userInfo.name}
            </Text>
            <Text variant="body" color="textSecondary" className="mb-1">
              {userInfo.email}
            </Text>
            <Text variant="caption" color="textSecondary">
              Member since {userInfo.joinDate}
            </Text>
          </View>

          <View className="space-y-4">
            <View className="p-4 bg-surface rounded-2xl border border-border">
              <Text variant="label" className="mb-2">Settings</Text>
              <View className="space-y-3">
                <Button
                  title="Edit Profile"
                  variant="ghost"
                  size="sm"
                  onPress={() => console.log("Edit profile")}
                />
                <Button
                  title="Preferences"
                  variant="ghost"
                  size="sm"
                  onPress={() => console.log("Preferences")}
                />
                <Button
                  title="Privacy"
                  variant="ghost"
                  size="sm"
                  onPress={() => console.log("Privacy")}
                />
              </View>
            </View>

            <Button
              title="Sign Out"
              variant="danger"
              size="md"
              fullWidth
              onPress={() => console.log("Sign out")}
            />
          </View>
        </View>
      </ScrollView>
    </FullScreenLayout>
  );
}
`;
    fs.writeFileSync(path.join(appPath, "app", "(tabs)", "profile.tsx"), profileScreen);
  } else {
    // Create simple home screen without tabs
    const simpleHomeScreen = `
import React from "react";
import { View, ScrollView } from "react-native";
import { FullScreenLayout, Text, Button } from "../../components/ui";

export default function HomeScreen() {
  return (
    <FullScreenLayout>
      <ScrollView className="flex-1">
        <View className="px-6 pt-6">
          <Text variant="heading" className="mb-2">
            Welcome to ${appName}!
          </Text>
          <Text variant="body" color="textSecondary" className="mb-6">
            Your modern Expo app is ready to go.
          </Text>

          <View className="space-y-4">
            <Button
              title="Get Started"
              variant="primary"
              size="lg"
              fullWidth
              onPress={() => console.log("Get Started pressed")}
            />
            
            <Button
              title="Learn More"
              variant="outline"
              size="md"
              fullWidth
              onPress={() => console.log("Learn More pressed")}
            />

            <Button
              title="Contact Support"
              variant="ghost"
              size="md"
              fullWidth
              onPress={() => console.log("Contact Support pressed")}
            />
          </View>

          <View className="mt-8 p-4 bg-surface rounded-2xl border border-border">
            <Text variant="subheading" className="mb-2">
              Getting Started
            </Text>
            <Text variant="body" color="textSecondary">
              This is your main app screen. You can start building your features here.
            </Text>
          </View>
        </View>
      </ScrollView>
    </FullScreenLayout>
  );
}
`;
    fs.writeFileSync(path.join(appPath, "app", "index.tsx"), simpleHomeScreen);
  }

  // Step 12: Create main layout
  const mainLayout = `
import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import { SplashScreen } from "expo-splash-screen";
import "../global.css";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    "${font}": require("expo-google-fonts/${font.toLowerCase()}").${font},
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      ${needsAuth ? `
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      ` : needsBottomTabs ? `
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      ` : `
      <Stack.Screen name="index" />
      `}
    </Stack>
  );
}
`;
  fs.writeFileSync(path.join(appPath, "app", "_layout.tsx"), mainLayout);

  // Step 13: Create global CSS
  const globalCSS = `
@tailwind base;
@tailwind components;
@tailwind utilities;
`;
  fs.writeFileSync(path.join(appPath, "global.css"), globalCSS);

  // Step 14: Update metro config
  const metroConfig = `
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: "./global.css" });
`;
  fs.writeFileSync(path.join(appPath, "metro.config.js"), metroConfig);

  // Step 15: Create utility hooks
  const useThemeHook = `
import { theme } from "../constants/theme";

export const useTheme = () => {
  return theme;
};
`;
  fs.writeFileSync(path.join(appPath, "hooks", "useTheme.ts"), useThemeHook);

  // Step 17: Create validation utilities
  const validationUtils = `
export const validationRules = {
  email: {
    required: "Email is required",
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}$/i,
      message: "Invalid email address"
    }
  },
  password: {
    required: "Password is required",
    minLength: {
      value: 6,
      message: "Password must be at least 6 characters"
    }
  },
  name: {
    required: "Name is required",
    minLength: {
      value: 2,
      message: "Name must be at least 2 characters"
    }
  }
};

export const formatters = {
  capitalize: (str: string) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase(),
  truncate: (str: string, length: number) => str.length > length ? str.substring(0, length) + "..." : str,
};
`;
  fs.writeFileSync(path.join(appPath, "utils", "validation.ts"), validationUtils);

  // Step 18: Update package.json
  const packageJson = JSON.parse(fs.readFileSync(path.join(appPath, "package.json"), "utf8"));
  packageJson.main = "./app/_layout.tsx";
  fs.writeFileSync(path.join(appPath, "package.json"), JSON.stringify(packageJson, null, 2));

  console.log(chalk.green(`\n🎉 Modern Expo boilerplate created successfully!`));
  console.log(chalk.cyan(`\n📁 Project Structure:`));
  console.log(chalk.white(`├── app/                 # Expo Router pages`));
  if (needsAuth) {
    console.log(chalk.white(`│   ├── login.tsx        # Login page`));
    console.log(chalk.white(`│   ├── signup.tsx       # Signup page`));
  }
  if (needsBottomTabs) {
    console.log(chalk.white(`│   └── (tabs)/          # Bottom tab navigation`));
    console.log(chalk.white(`│       ├── index.tsx    # Home tab`));
    console.log(chalk.white(`│       ├── explore.tsx  # Explore tab`));
    console.log(chalk.white(`│       ├── notifications.tsx # Notifications tab`));
    console.log(chalk.white(`│       └── profile.tsx  # Profile tab`));
  }
  console.log(chalk.white(`├── components/ui/       # Reusable UI components`));
  console.log(chalk.white(`├── constants/theme.ts   # App theme configuration`));
  console.log(chalk.white(`├── hooks/               # Custom React hooks`));
  console.log(chalk.white(`└── utils/               # Utility functions`));
  
  console.log(chalk.cyan(`\n🎨 Theme Colors:`));
  console.log(chalk.white(`Primary: ${colors.primary}`));
  console.log(chalk.white(`Secondary: ${colors.secondary}`));
  console.log(chalk.white(`Font: ${font}`));

  console.log(chalk.cyan(`\n🚀 Features Included:`));
  console.log(chalk.white(`✅ Modern reusable UI components (Text, Button, TextField)`));
  console.log(chalk.white(`✅ Layout components (SafeAreaLayout, FullScreenLayout)`));
  console.log(chalk.white(`✅ Expo Router navigation`));
  console.log(chalk.white(`✅ TailwindCSS with NativeWind`));
  console.log(chalk.white(`✅ React Hook Form integration`));
  console.log(chalk.white(`✅ Custom theme system`));
  if (needsAuth) console.log(chalk.white(`✅ Authentication pages`));
  if (needsBottomTabs) console.log(chalk.white(`✅ Bottom tab navigation`));

  console.log(chalk.cyan(`\n👉 Next steps:`));
  console.log(chalk.white(`cd ${appName}`));
  console.log(chalk.white(`npm start`));
  console.log(chalk.cyan(`\n📖 Start editing your components in the components/ui/ folder!`));
};

run().catch(console.error);