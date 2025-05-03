.
├── node_modules # Installed dependencies
├── public # Static public assets, not processed by Vite
├── src # Main application source code
│   ├── app # Core app structure: App.tsx, routing, global providers
│   │   ├── routes # Application-level route components
│   ├── assets # Static assets like images or icons used in code
│   ├── components # Reusable UI components shared across the app
│   ├── config # Global configuration files (e.g., constants, themes)
│   ├── contexts # Global React Contexts not tied to specific features
│   ├── features # Feature-based module organization (e.g., auth, user)
│   │   └── feature_1 # feature module
│   │   ├── api # API calls related
│   │   ├── components # UI components specific
│   │   ├── contexts # Contexts scoped to the feature
│   │   ├── stores # Redux slice or state management for feature
│   │   ├── types # Type definitions for feature
│   │   └── utils # Utility functions used by feature
│   │   └── feature_2
│   │ ........
│   ├── hooks # Custom React hooks
│   ├── layouts # App layout components (Header, Sidebar, Footer, etc.)
│   ├── lib # External libraries or singletons (e.g., Axios instance)
│   ├── stores # Redux store configuration
│   ├── testing # Test utilities and test files
│   ├── types # Global TypeScript type definitions
│   ├── utils # General-purpose utility functions
