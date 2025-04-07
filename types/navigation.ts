import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  login: undefined;
  register: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
} 