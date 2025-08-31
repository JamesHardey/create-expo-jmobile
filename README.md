# Create Modern Expo App

A modern CLI tool to quickly scaffold Expo applications with:

- 🎨 **Custom theming** with your brand colors
- 🧩 **Reusable UI components** (Text, Button, TextField, Layouts)
- 🧭 **Expo Router navigation** with conditional setup
- 🎯 **TypeScript** support out of the box
- 💅 **TailwindCSS** with NativeWind
- 🔐 **Optional authentication** pages
- 📱 **Bottom tab navigation** when needed
- ✅ **Form validation** with React Hook Form

## Quick Start

```bash
npx create-expo-jmobile
```

Or install globally:

```bash
npm install -g create-expo-jmobile
create-expo-jmobile
```

## Features

### 🎨 Modern UI Components

All components support variants, sizes, and custom colors:

```tsx
// Text with variants
<Text variant="heading" color="primary">Welcome</Text>
<Text variant="body" color="textSecondary">Subtitle</Text>

// Buttons with different styles
<Button title="Primary Action" variant="primary" size="lg" />
<Button title="Secondary" variant="outline" size="md" />

// Form fields with validation
<TextField 
  control={control}
  name="email"
  label="Email"
  placeholder="Enter email"
  rules={validationRules.email}
/>
```

### 🧭 Smart Navigation Setup

The CLI automatically sets up:
- **Simple navigation** for basic apps
- **Bottom tabs** with 4 pre-built screens (Home, Explore, Notifications, Profile)
- **Authentication flow** with login/signup pages
- **Expo Router** with proper TypeScript integration

### 🎨 Custom Theming

- Choose from popular fonts (Inter, Poppins, Montserrat, Roboto, Lato)
- Set custom primary and secondary colors
- Automatic color palette generation
- Consistent theming across all components

## Project Structure

```
my-app/
├── app/                    # Expo Router pages
│   ├── _layout.tsx        # Root layout
│   ├── (tabs)/           # Tab navigation (optional)
│   ├── login.tsx         # Auth pages (optional)
│   └── signup.tsx
├── components/ui/         # Reusable components
│   ├── Text.tsx
│   ├── Button.tsx
│   ├── TextField.tsx
│   ├── SafeAreaLayout.tsx
│   └── FullScreenLayout.tsx
├── constants/theme.ts     # Theme configuration
├── hooks/                 # Custom hooks
├── utils/                 # Utility functions
└── global.css            # TailwindCSS styles
```

## Requirements

- Node.js 16+ 
- npm or yarn
- Expo CLI (will be installed automatically)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT © [Your Name]

## Support

If you encounter any issues, please [open an issue](https://github.com/jameshardey/create-expo-jmobile/issues) on GitHub.