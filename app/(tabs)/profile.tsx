import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useState, useEffect } from 'react';
import { GradientBackground } from '@/components/ui/LinearGradient';
import { Card } from '@/components/ui/Card';
import { CircularProgress } from '@/components/ui/CircularProgress';
import { User, Settings, Bell, Moon, Trophy, Target, Zap, Crown } from 'lucide-react-native';
import { StorageService, UserProfile } from '@/services/storageService';

export default function Profile() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const profile = await StorageService.getUserProfile();
      setUserProfile(profile);
    } catch (error) {
      console.error('Erreur chargement profil:', error);
    }
  };

  const updateNotifications = async (enabled: boolean) => {
    if (!userProfile) return;

    const updatedProfile = {
      ...userProfile,
      preferences: {
        ...userProfile.preferences,
        notifications: enabled
      }
    };

    setUserProfile(updatedProfile);
    await StorageService.saveUserProfile(updatedProfile);
  };

  const updateDifficulty = async (difficulty: 'easy' | 'medium' | 'hard') => {
    if (!userProfile) return;

    const updatedProfile = {
      ...userProfile,
      preferences: {
        ...userProfile.preferences,
        difficulty
      }
    };

    setUserProfile(updatedProfile);
    await StorageService.saveUserProfile(updatedProfile);
  };

  const getLevelProgress = () => {
    if (!userProfile) return 0;
    return (userProfile.xp % 100);
  };

  const getXPToNextLevel = () => {
    if (!userProfile) return 100;
    return 100 - (userProfile.xp % 100);
  };

  const getLevelTitle = (level: number) => {
    if (level >= 50) return 'Maître Zen';
    if (level >= 25) return 'Sage';
    if (level >= 15) return 'Guerrier';
    if (level >= 10) return 'Explorateur';
    if (level >= 5) return 'Apprenti';
    return 'Novice';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '#00d4aa';
      case 'medium': return '#f59e0b';
      case 'hard': return '#ef4444';
      default: return '#00d4aa';
    }
  };

  if (!userProfile) {
    return (
      <GradientBackground>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Profil</Text>
          <Settings size={28} color="#00d4aa" />
        </View>

        {/* Profil utilisateur */}
        <Card gradient colors={['#1e40af', '#3b82f6']}>
          <View style={styles.profileSection}>
            <View style={styles.profileInfo}>
              <View style={styles.profileHeader}>
                <View style={styles.avatarContainer}>
                  <User size={32} color="#ffffff" />
                </View>
                <View style={styles.profileText}>
                  <Text style={styles.userName}>{userProfile.name}</Text>
                  <Text style={styles.userTitle}>{getLevelTitle(userProfile.level)}</Text>
                </View>
              </View>
              
              <View style={styles.levelInfo}>
                <Text style={styles.levelText}>Niveau {userProfile.level}</Text>
                <Text style={styles.xpText}>
                  {userProfile.xp} XP • {getXPToNextLevel()} jusqu'au prochain niveau
                </Text>
              </View>
            </View>

            <CircularProgress
              progress={getLevelProgress()}
              size={80}
              color="#ffffff"
              backgroundColor="rgba(255,255,255,0.3)"
            >
              <Crown size={24} color="#ffffff" />
            </CircularProgress>
          </View>
        </Card>

        {/* Statistiques rapides */}
        <View style={styles.statsSection}>
          <View style={styles.statsRow}>
            <Card style={styles.statCard}>
              <View style={styles.statContent}>
                <Trophy size={20} color="#f59e0b" />
                <Text style={styles.statNumber}>{userProfile.level}</Text>
                <Text style={styles.statLabel}>Niveau</Text>
              </View>
            </Card>
            
            <Card style={styles.statCard}>
              <View style={styles.statContent}>
                <Zap size={20} color="#00d4aa" />
                <Text style={styles.statNumber}>{userProfile.totalXp}</Text>
                <Text style={styles.statLabel}>XP Total</Text>
              </View>
            </Card>
            
            <Card style={styles.statCard}>
              <View style={styles.statContent}>
                <Target size={20} color="#8b5cf6" />
                <Text style={styles.statNumber}>{userProfile.streak}</Text>
                <Text style={styles.statLabel}>Série</Text>
              </View>
            </Card>
          </View>
        </View>

        {/* Paramètres */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Paramètres</Text>
          
          {/* Notifications */}
          <Card style={styles.settingCard}>
            <View style={styles.settingContent}>
              <View style={styles.settingInfo}>
                <Bell size={20} color="#00d4aa" />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Notifications</Text>
                  <Text style={styles.settingSubtitle}>
                    Recevoir des rappels quotidiens
                  </Text>
                </View>
              </View>
              <Switch
                value={userProfile.preferences.notifications}
                onValueChange={updateNotifications}
                trackColor={{ false: '#374151', true: '#00d4aa' }}
                thumbColor="#ffffff"
              />
            </View>
          </Card>

          {/* Difficulté */}
          <Card style={styles.settingCard}>
            <View style={styles.settingHeader}>
              <Moon size={20} color="#8b5cf6" />
              <Text style={styles.settingTitle}>Difficulté des objectifs</Text>
            </View>
            
            <View style={styles.difficultyOptions}>
              {['easy', 'medium', 'hard'].map((difficulty) => (
                <TouchableOpacity
                  key={difficulty}
                  style={[
                    styles.difficultyOption,
                    userProfile.preferences.difficulty === difficulty && styles.selectedDifficulty,
                    { borderColor: getDifficultyColor(difficulty) }
                  ]}
                  onPress={() => updateDifficulty(difficulty as 'easy' | 'medium' | 'hard')}
                >
                  <Text style={[
                    styles.difficultyText,
                    userProfile.preferences.difficulty === difficulty && 
                    { color: getDifficultyColor(difficulty) }
                  ]}>
                    {difficulty === 'easy' ? 'Facile' : 
                     difficulty === 'medium' ? 'Moyen' : 'Difficile'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>
        </View>

        {/* Catégories préférées */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Catégories préférées</Text>
          <Card>
            <View style={styles.categoriesGrid}>
              {userProfile.preferences.categories.map((category) => (
                <View key={category} style={styles.categoryChip}>
                  <Text style={styles.categoryText}>{category}</Text>
                </View>
              ))}
            </View>
          </Card>
        </View>

        {/* Informations sur l'app */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>À propos</Text>
          <Card>
            <View style={styles.aboutContent}>
              <Text style={styles.aboutTitle}>HabitLevelUp</Text>
              <Text style={styles.aboutVersion}>Version 1.0.0</Text>
              <Text style={styles.aboutDescription}>
                Développe de meilleures habitudes avec l'aide de l'intelligence artificielle. 
                Progresse jour après jour et deviens la meilleure version de toi-même.
              </Text>
            </View>
          </Card>
        </View>
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 40,
  },
  title: {
    color: '#ffffff',
    fontSize: 28,
    fontFamily: 'Poppins-Bold',
  },
  profileSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileText: {
    flex: 1,
  },
  userName: {
    color: '#ffffff',
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    marginBottom: 4,
  },
  userTitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  levelInfo: {
    marginBottom: 8,
  },
  levelText: {
    color: '#ffffff',
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 4,
  },
  xpText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  statsSection: {
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    padding: 16,
  },
  statContent: {
    alignItems: 'center',
  },
  statNumber: {
    color: '#ffffff',
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    color: '#9ca3af',
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 16,
  },
  settingCard: {
    marginBottom: 12,
  },
  settingContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 16,
    flex: 1,
  },
  settingTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  settingSubtitle: {
    color: '#9ca3af',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  difficultyOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  difficultyOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4b5563',
    alignItems: 'center',
  },
  selectedDifficulty: {
    backgroundColor: 'rgba(0, 212, 170, 0.1)',
  },
  difficultyText: {
    color: '#9ca3af',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 212, 170, 0.2)',
  },
  categoryText: {
    color: '#00d4aa',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    textTransform: 'capitalize',
  },
  aboutContent: {
    alignItems: 'center',
    padding: 8,
  },
  aboutTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    marginBottom: 8,
  },
  aboutVersion: {
    color: '#9ca3af',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginBottom: 16,
  },
  aboutDescription: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 24,
  },
});