import "dotenv/config";

export default {
  expo: {
    name: "Memento",
    slug: "memento",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./src/assets/images/logo.png",
    scheme: "memento",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.memento.app",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./src/assets/images/logo.png",
        backgroundColor: "#dceefe",
      },
      package: "com.memento.app",
      config: {
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY,
        },
      },
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./src/assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./src/assets/images/logo.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#dceefe",
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      router: {
        origin: false,
      },
      eas: {
        projectId: "63d8d9ee-03ae-44f4-868d-d744db928f53",
      },
    },
    owner: "ece493",
  },
};
