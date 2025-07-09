import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserProfile {
  name: string;
  level: number;
  xp: number;
  totalXp: number;
  streak: number;
  preferences: {
    notifications: boolean;
    difficulty: 'easy' | 'medium' | 'hard';
    categories: string[];
  };
}

export interface Habit {
  id: string;
  name: string;
  category: string;
  streak: number;
  completed: boolean;
  createdAt: Date;
  completedDates: string[];
}

export interface DailyObjective {
  id: string;
  text: string;
  completed: boolean;
  xpReward: number;
  createdAt: Date;
}

export class StorageService {
  private static readonly USER_PROFILE_KEY = 'userProfile';
  private static readonly HABITS_KEY = 'habits';
  private static readonly OBJECTIVES_KEY = 'objectives';
  private static readonly STATS_KEY = 'stats';

  // Profil utilisateur
  static async getUserProfile(): Promise<UserProfile> {
    try {
      const data = await AsyncStorage.getItem(this.USER_PROFILE_KEY);
      return data ? JSON.parse(data) : this.getDefaultProfile();
    } catch (error) {
      console.error('Erreur lecture profil:', error);
      return this.getDefaultProfile();
    }
  }

  static async saveUserProfile(profile: UserProfile): Promise<void> {
    try {
      await AsyncStorage.setItem(this.USER_PROFILE_KEY, JSON.stringify(profile));
    } catch (error) {
      console.error('Erreur sauvegarde profil:', error);
    }
  }

  // Habitudes
  static async getHabits(): Promise<Habit[]> {
    try {
      const data = await AsyncStorage.getItem(this.HABITS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Erreur lecture habitudes:', error);
      return [];
    }
  }

  static async saveHabits(habits: Habit[]): Promise<void> {
    try {
      await AsyncStorage.setItem(this.HABITS_KEY, JSON.stringify(habits));
    } catch (error) {
      console.error('Erreur sauvegarde habitudes:', error);
    }
  }

  // Objectifs quotidiens
  static async getDailyObjectives(): Promise<DailyObjective[]> {
    try {
      const data = await AsyncStorage.getItem(this.OBJECTIVES_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Erreur lecture objectifs:', error);
      return [];
    }
  }

  static async saveDailyObjectives(objectives: DailyObjective[]): Promise<void> {
    try {
      await AsyncStorage.setItem(this.OBJECTIVES_KEY, JSON.stringify(objectives));
    } catch (error) {
      console.error('Erreur sauvegarde objectifs:', error);
    }
  }

  // Statistiques
  static async getStats(): Promise<any> {
    try {
      const data = await AsyncStorage.getItem(this.STATS_KEY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Erreur lecture stats:', error);
      return {};
    }
  }

  static async saveStats(stats: any): Promise<void> {
    try {
      await AsyncStorage.setItem(this.STATS_KEY, JSON.stringify(stats));
    } catch (error) {
      console.error('Erreur sauvegarde stats:', error);
    }
  }

  private static getDefaultProfile(): UserProfile {
    return {
      name: 'Utilisateur',
      level: 1,
      xp: 0,
      totalXp: 0,
      streak: 0,
      preferences: {
        notifications: true,
        difficulty: 'medium',
        categories: ['santé', 'productivité', 'mindset']
      }
    };
  }
}