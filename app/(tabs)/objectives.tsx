import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import { GradientBackground } from '@/components/ui/LinearGradient';
import { Card } from '@/components/ui/Card';
import { Target, Sparkles, Clock, CircleCheck as CheckCircle2, RefreshCw } from 'lucide-react-native';
import { StorageService, DailyObjective, UserProfile } from '@/services/storageService';
import { GroqService } from '@/services/groqService';

export default function Objectives() {
  const [objectives, setObjectives] = useState<DailyObjective[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [completedToday, setCompletedToday] = useState(0);

  const groqService = new GroqService();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const objectivesData = await StorageService.getDailyObjectives();
      const profile = await StorageService.getUserProfile();
      
      setObjectives(objectivesData);
      setUserProfile(profile);
      setCompletedToday(objectivesData.filter(obj => obj.completed).length);
    } catch (error) {
      console.error('Erreur chargement objectifs:', error);
    }
  };

  const generateNewObjectives = async () => {
    if (!userProfile) return;

    setIsGenerating(true);
    try {
      const objectiveTexts = await groqService.generateDailyObjectives(userProfile);
      const newObjectives: DailyObjective[] = objectiveTexts.map((text, index) => ({
        id: `obj_${Date.now()}_${index}`,
        text,
        completed: false,
        xpReward: 15 + (index * 5),
        createdAt: new Date()
      }));
      
      setObjectives(newObjectives);
      await StorageService.saveDailyObjectives(newObjectives);
      setCompletedToday(0);
    } catch (error) {
      console.error('Erreur génération objectifs:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const completeObjective = async (objectiveId: string) => {
    if (!userProfile) return;

    const objective = objectives.find(obj => obj.id === objectiveId);
    if (!objective || objective.completed) return;

    // Marquer l'objectif comme complété
    const updatedObjectives = objectives.map(obj => 
      obj.id === objectiveId ? { ...obj, completed: true } : obj
    );

    // Récompenser l'utilisateur
    const newXp = userProfile.xp + objective.xpReward;
    const newLevel = Math.floor(newXp / 100) + 1;
    const newStreak = userProfile.streak + 1;

    const updatedProfile = {
      ...userProfile,
      xp: newXp,
      level: newLevel,
      streak: newStreak,
      totalXp: userProfile.totalXp + objective.xpReward
    };

    setObjectives(updatedObjectives);
    setUserProfile(updatedProfile);
    setCompletedToday(completedToday + 1);

    await StorageService.saveDailyObjectives(updatedObjectives);
    await StorageService.saveUserProfile(updatedProfile);
  };

  const getDifficultyColor = (xpReward: number) => {
    if (xpReward <= 15) return '#00d4aa'; // Facile
    if (xpReward <= 20) return '#f59e0b'; // Moyen
    return '#ef4444'; // Difficile
  };

  const getDifficultyText = (xpReward: number) => {
    if (xpReward <= 15) return 'Facile';
    if (xpReward <= 20) return 'Moyen';
    return 'Difficile';
  };

  const getCompletionPercentage = () => {
    if (objectives.length === 0) return 0;
    return (completedToday / objectives.length) * 100;
  };

  return (
    <GradientBackground>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Objectifs du jour</Text>
          <TouchableOpacity 
            style={styles.generateButton}
            onPress={generateNewObjectives}
            disabled={isGenerating}
          >
            <RefreshCw size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Progression du jour */}
        <Card gradient colors={['#3b82f6', '#1e40af']}>
          <View style={styles.progressSection}>
            <View style={styles.progressInfo}>
              <Text style={styles.progressTitle}>Progression du jour</Text>
              <Text style={styles.progressText}>
                {completedToday} / {objectives.length} objectifs
              </Text>
              <Text style={styles.progressPercentage}>
                {Math.round(getCompletionPercentage())}%
              </Text>
            </View>
            <View style={styles.progressIcon}>
              <Target size={32} color="#ffffff" />
            </View>
          </View>
        </Card>

        {/* Statistiques */}
        <View style={styles.statsSection}>
          <View style={styles.statsRow}>
            <Card style={styles.statCard}>
              <View style={styles.statContent}>
                <Sparkles size={20} color="#f59e0b" />
                <Text style={styles.statNumber}>
                  {objectives.reduce((sum, obj) => sum + obj.xpReward, 0)}
                </Text>
                <Text style={styles.statLabel}>XP disponible</Text>
              </View>
            </Card>
            
            <Card style={styles.statCard}>
              <View style={styles.statContent}>
                <CheckCircle2 size={20} color="#00d4aa" />
                <Text style={styles.statNumber}>{completedToday}</Text>
                <Text style={styles.statLabel}>Complétés</Text>
              </View>
            </Card>
            
            <Card style={styles.statCard}>
              <View style={styles.statContent}>
                <Clock size={20} color="#8b5cf6" />
                <Text style={styles.statNumber}>
                  {objectives.length - completedToday}
                </Text>
                <Text style={styles.statLabel}>Restants</Text>
              </View>
            </Card>
          </View>
        </View>

        {/* Liste des objectifs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Objectifs d'aujourd'hui</Text>
          
          {objectives.map((objective, index) => (
            <Card
              key={objective.id}
              onPress={() => completeObjective(objective.id)}
              style={[
                styles.objectiveCard,
                objective.completed && styles.completedObjective
              ]}
            >
              <View style={styles.objectiveContent}>
                <View style={styles.objectiveNumber}>
                  <Text style={styles.objectiveIndex}>{index + 1}</Text>
                </View>
                
                <View style={styles.objectiveInfo}>
                  <Text style={[
                    styles.objectiveText,
                    objective.completed && styles.completedText
                  ]}>
                    {objective.text}
                  </Text>
                  
                  <View style={styles.objectiveDetails}>
                    <View style={[
                      styles.difficultyBadge,
                      { backgroundColor: getDifficultyColor(objective.xpReward) + '20' }
                    ]}>
                      <Text style={[
                        styles.difficultyText,
                        { color: getDifficultyColor(objective.xpReward) }
                      ]}>
                        {getDifficultyText(objective.xpReward)}
                      </Text>
                    </View>
                    
                    <Text style={styles.xpReward}>
                      +{objective.xpReward} XP
                    </Text>
                  </View>
                </View>

                <View style={styles.objectiveStatus}>
                  {objective.completed ? (
                    <View style={styles.completedIcon}>
                      <CheckCircle2 size={24} color="#00d4aa" />
                    </View>
                  ) : (
                    <View style={styles.pendingIcon}>
                      <View style={styles.pendingDot} />
                    </View>
                  )}
                </View>
              </View>
            </Card>
          ))}

          {objectives.length === 0 && (
            <Card style={styles.emptyState}>
              <View style={styles.emptyStateContent}>
                <Target size={48} color="#6b7280" />
                <Text style={styles.emptyStateText}>
                  Aucun objectif pour aujourd'hui
                </Text>
                <Text style={styles.emptyStateSubtext}>
                  Appuie sur le bouton de génération pour créer tes objectifs quotidiens
                </Text>
                <TouchableOpacity
                  style={styles.generateObjectivesButton}
                  onPress={generateNewObjectives}
                  disabled={isGenerating}
                >
                  <Sparkles size={20} color="#ffffff" />
                  <Text style={styles.generateObjectivesText}>
                    {isGenerating ? 'Génération...' : 'Générer mes objectifs'}
                  </Text>
                </TouchableOpacity>
              </View>
            </Card>
          )}
        </View>

        {/* Bouton de régénération */}
        {objectives.length > 0 && (
          <Card style={styles.regenerateCard}>
            <TouchableOpacity
              style={styles.regenerateButton}
              onPress={generateNewObjectives}
              disabled={isGenerating}
            >
              <RefreshCw size={20} color="#ffffff" />
              <Text style={styles.regenerateText}>
                {isGenerating ? 'Génération en cours...' : 'Générer de nouveaux objectifs'}
              </Text>
            </TouchableOpacity>
          </Card>
        )}
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
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
  generateButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#00d4aa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressInfo: {
    flex: 1,
  },
  progressTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 8,
  },
  progressText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginBottom: 4,
  },
  progressPercentage: {
    color: '#ffffff',
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
  },
  progressIcon: {
    opacity: 0.7,
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
  objectiveCard: {
    marginBottom: 16,
  },
  completedObjective: {
    opacity: 0.7,
  },
  objectiveContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  objectiveNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#00d4aa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  objectiveIndex: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  objectiveInfo: {
    flex: 1,
  },
  objectiveText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    marginBottom: 8,
    lineHeight: 24,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#9ca3af',
  },
  objectiveDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  xpReward: {
    color: '#00d4aa',
    fontSize: 14,
    fontFamily: 'Inter-Bold',
  },
  objectiveStatus: {
    marginLeft: 16,
  },
  completedIcon: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pendingIcon: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pendingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4b5563',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateContent: {
    alignItems: 'center',
  },
  emptyStateText: {
    color: '#ffffff',
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    color: '#9ca3af',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  generateObjectivesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#00d4aa',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  generateObjectivesText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  regenerateCard: {
    marginBottom: 24,
  },
  regenerateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#374151',
    paddingVertical: 16,
    borderRadius: 12,
  },
  regenerateText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
});