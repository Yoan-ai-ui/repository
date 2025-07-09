import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useState, useEffect } from 'react';
import { GradientBackground } from '@/components/ui/LinearGradient';
import { Card } from '@/components/ui/Card';
import { CircularProgress } from '@/components/ui/CircularProgress';
import { Trophy, Target, Zap, Calendar, Star } from 'lucide-react-native';
import { StorageService, UserProfile, DailyObjective } from '@/services/storageService';
import { GroqService } from '@/services/groqService';

export default function Dashboard() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [objectives, setObjectives] = useState<DailyObjective[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [motivationalMessage, setMotivationalMessage] = useState('');

  const groqService = new GroqService();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const profile = await StorageService.getUserProfile();
      const dailyObjectives = await StorageService.getDailyObjectives();
      
      setUserProfile(profile);
      setObjectives(dailyObjectives);

      // Générer des objectifs si aucun pour aujourd'hui
      if (dailyObjectives.length === 0) {
        await generateDailyObjectives(profile);
      }

      // Générer un message motivationnel
      const message = await groqService.generateMotivationalMessage({
        level: profile.level,
        xp: profile.xp,
        streak: profile.streak
      });
      setMotivationalMessage(message);
    } catch (error) {
      console.error('Erreur chargement données:', error);
    }
  };

  const generateDailyObjectives = async (profile: UserProfile) => {
    try {
      const objectiveTexts = await groqService.generateDailyObjectives(profile);
      const newObjectives: DailyObjective[] = objectiveTexts.map((text, index) => ({
        id: `obj_${Date.now()}_${index}`,
        text,
        completed: false,
        xpReward: 15 + (index * 5),
        createdAt: new Date()
      }));
      
      setObjectives(newObjectives);
      await StorageService.saveDailyObjectives(newObjectives);
    } catch (error) {
      console.error('Erreur génération objectifs:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const completeObjective = async (objectiveId: string) => {
    if (!userProfile) return;

    const updatedObjectives = objectives.map(obj => 
      obj.id === objectiveId ? { ...obj, completed: true } : obj
    );
    
    const completedObjective = objectives.find(obj => obj.id === objectiveId);
    if (completedObjective) {
      const newXp = userProfile.xp + completedObjective.xpReward;
      const newLevel = Math.floor(newXp / 100) + 1;
      
      const updatedProfile = {
        ...userProfile,
        xp: newXp,
        level: newLevel,
        totalXp: userProfile.totalXp + completedObjective.xpReward
      };
      
      setUserProfile(updatedProfile);
      setObjectives(updatedObjectives);
      
      await StorageService.saveUserProfile(updatedProfile);
      await StorageService.saveDailyObjectives(updatedObjectives);
    }
  };

  const getLevelProgress = () => {
    if (!userProfile) return 0;
    return (userProfile.xp % 100);
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
      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>Bonjour, {userProfile.name} !</Text>
          <Text style={styles.motivationText}>{motivationalMessage}</Text>
        </View>

        {/* Profil et niveau */}
        <Card gradient colors={['#00d4aa', '#4fd1c7']}>
          <View style={styles.profileSection}>
            <View style={styles.profileInfo}>
              <Text style={styles.levelText}>Niveau {userProfile.level}</Text>
              <Text style={styles.xpText}>{userProfile.xp} XP</Text>
            </View>
            <CircularProgress
              progress={getLevelProgress()}
              size={80}
              color="#ffffff"
              backgroundColor="rgba(255,255,255,0.3)"
            >
              <Trophy size={24} color="#ffffff" />
            </CircularProgress>
          </View>
        </Card>

        {/* Statistiques rapides */}
        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <View style={styles.statContent}>
              <Target size={20} color="#00d4aa" />
              <Text style={styles.statNumber}>{objectives.filter(obj => obj.completed).length}</Text>
              <Text style={styles.statLabel}>Objectifs</Text>
            </View>
          </Card>
          
          <Card style={styles.statCard}>
            <View style={styles.statContent}>
              <Zap size={20} color="#f59e0b" />
              <Text style={styles.statNumber}>{userProfile.streak}</Text>
              <Text style={styles.statLabel}>Série</Text>
            </View>
          </Card>
          
          <Card style={styles.statCard}>
            <View style={styles.statContent}>
              <Star size={20} color="#8b5cf6" />
              <Text style={styles.statNumber}>{userProfile.totalXp}</Text>
              <Text style={styles.statLabel}>XP Total</Text>
            </View>
          </Card>
        </View>

        {/* Objectifs quotidiens */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Objectifs du jour</Text>
          {objectives.map((objective) => (
            <Card
              key={objective.id}
              onPress={() => !objective.completed && completeObjective(objective.id)}
              style={[
                styles.objectiveCard,
                objective.completed && styles.completedObjective
              ]}
            >
              <View style={styles.objectiveContent}>
                <View style={styles.objectiveInfo}>
                  <Text style={[
                    styles.objectiveText,
                    objective.completed && styles.completedText
                  ]}>
                    {objective.text}
                  </Text>
                  <Text style={styles.xpReward}>+{objective.xpReward} XP</Text>
                </View>
                <View style={[
                  styles.objectiveStatus,
                  objective.completed && styles.completedStatus
                ]}>
                  {objective.completed && <Text style={styles.checkmark}>✓</Text>}
                </View>
              </View>
            </Card>
          ))}
        </View>

        {/* Habitudes rapides */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Habitudes importantes</Text>
          <Card>
            <View style={styles.habitPreview}>
              <Calendar size={20} color="#00d4aa" />
              <Text style={styles.habitText}>Voir toutes les habitudes</Text>
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
    marginBottom: 24,
    marginTop: 40,
  },
  greeting: {
    color: '#ffffff',
    fontSize: 28,
    fontFamily: 'Poppins-Bold',
    marginBottom: 8,
  },
  motivationText: {
    color: '#9ca3af',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    lineHeight: 24,
  },
  profileSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  levelText: {
    color: '#ffffff',
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    marginBottom: 4,
  },
  xpText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
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
  objectiveCard: {
    marginBottom: 12,
  },
  completedObjective: {
    opacity: 0.7,
  },
  objectiveContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  objectiveInfo: {
    flex: 1,
  },
  objectiveText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    marginBottom: 4,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#9ca3af',
  },
  xpReward: {
    color: '#00d4aa',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  objectiveStatus: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4b5563',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedStatus: {
    backgroundColor: '#00d4aa',
    borderColor: '#00d4aa',
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  habitPreview: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  habitText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    marginLeft: 12,
  },
});