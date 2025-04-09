import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  home: undefined;
  login: undefined;
  register: undefined;
  UploadKot: undefined;
  Profile: undefined;
  EditKot: {
    kot: {
      id: string;
      title: string;
      description: string;
      price: number;
      location: string;
      images: string;
      created_at: string;
      user_id: string;
    };
  };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
} 