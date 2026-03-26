---
trigger: always_on
---

use import { SafeAreaView } from 'react-native-safe-area-context';
instead of import { SafeAreaView } from 'react-native';

because use import { SafeAreaView } from 'react-native-safe-area-context';
handles both android and ios
