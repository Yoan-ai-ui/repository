import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import { GradientBackground } from '@/components/ui/LinearGradient';
import { Card } from '@/components/ui/Card';
import { ChartBar as BarChart3, TrendingUp, Calendar, Trophy, Target, Zap } from 'lucide-react-native';
import { StorageService, UserProfile, Habit } from '@/services/storageService';

export default function Stats() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const profile = await StorageService.getUserProfile();
      const habitsData = await StorageService.getHabits();
      
      setUserProfile(profile);
      setHabits(habitsData);
      generateWeeklyStats(habitsData);
    } catch (error) {
      console.error('Erreur chargement stats:', error);
    }
  };

  const generateWeeklyStats = (habitsData: Habit[]) => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return {
        date: date.toISOString().split('T')[0],
        day: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
        completed: 0
      };
    }).reverse();

    const stats = last7Days.map(day => {
      const completedCount = habitsData.reduce((count, habit) => {
        return habit.completedDates.includes(day.date) ? count + 1 : count;
      }, 0);

      return {
        ...day,
        completed: completedCount,
        percentage: habitsData.length > 0 ? (completedCount / habitsData.length) * 100 : 0
      };
    });

    setWeeklyStats(stats);
  };

  const getTopHabits = () => {
    return habits
      .sort((a, b) => b.streak - a.streak)
      .slice(0, 3);
  };

  const getTotalCompletedHabits = () => {
    return habits.reduce((total, habit) => total + habit.completedDates.length, 0);
  };

  const getAverageStreak = () => {
    if (habits.length === 0) return 0;
    return Math.round(habits.reduce((sum, habit) => sum + habit.streak, 0) / habits.length);
  };

  const getCurrentStreak = () => {
    // Calculer la série actuelle basée sur les habitudes complétées
    const today = new Date().toISOString().split('T')[0];
    const completedToday = habits.filter(habit => habit.completedDates.includes(today)).length;
    return completedToday;
  };

  const getMaxBar = () => {
    return Math.max(...weeklyStats.map(stat => stat.completed), 1);
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
          <Text style={styles.title}>Statistiques</Text>
          <BarChart3 size={28} color="#00d4aa" />
        </View>

        {/* Métriques principales */}
        <View style={styles.metricsSection}>
          <View style={styles.metricsRow}>
            <Card style={styles.metricCard} gradient colors={['#00d4aa', '#4fd1c7']}>
              <View style={styles.metricContent}>
                <Trophy size={24} color="#ffffff" />
                <Text style={styles.metricNumber}>{userProfile.level}</Text>
                <Text style={styles.metricLabel}>Niveau</Text>
              </View>
            </Card>
            
            <Card style={styles.metricCard} gradient colors={['#3b82f6', '#1e40af']}>
              <View style={styles.metricContent}>
                <Zap size={24} color="#ffffff" />
                <Text style={styles.metricNumber}>{userProfile.totalXp}</Text>
                <Text style={styles.metricLabel}>XP Total</Text>
              </View>
            </Card>
          </View>

          <View style={styles.metricsRow}>
            <Card style={styles.metricCard} gradient colors={['#f59e0b', '#d97706']}>
              <View style={styles.metricContent}>
                <Target size={24} color="#ffffff" />
                <Text style={styles.metricNumber}>{getTotalCompletedHabits()}</Text>
                <Text style={styles.metricLabel}>Complétées</Text>
              </View>
            </Card>
            
            <Card style={styles.metricCard} gradient colors={['#8b5cf6', '#7c3aed']}>
              <View style={styles.metricContent}>
                <TrendingUp size={24} color="#ffffff" />
                <Text style={styles.metricNumber}>{getAverageStreak()}</Text>
                <Text style={styles.metricLabel}>Série moy.</Text>
              </View>
            </Card>
          </View>
        </View>

        {/* Graphique hebdomadaire */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activité de la semaine</Text>
          <Card>
            <View style={styles.chartContainer}>
              <View style={styles.chartHeader}>
                <Text style={styles.chartTitle}>Habitudes complétées</Text>
                <Text style={styles.chartSubtitle}>7 derniers jours</Text>
              </View>
              
              <View style={styles.chart}>
                {weeklyStats.map((stat, index) => (
                  <View key={index} style={styles.chartBar}>
                    <View style={styles.barContainer}>
                      <View 
                        style={[
                          styles.bar,
                          { 
                            height: `${(stat.completed / getMaxBar()) * 100}%`,
                            backgroundColor: stat.completed > 0 ? '#00d4aa' : '#374151'
                          }
                        ]}
                      />
                    </View>
                    <Text style={styles.barLabel}>{stat.day}</Text>
                    <Text style={styles.barValue}>{stat.completed}</Text>
                  </View>
                ))}
              </View>
            </View>
          </Card>
        </View>

        {/* Top habitudes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Meilleures habitudes</Text>
          {getTopHabits().map((habit, index) => (
            <Card key={habit.id} style={styles.habitCard}>
              <View style={styles.habitContent}>
                <View style={styles.habitRank}>
                  <Text style={styles.rankNumber}>{index + 1}</Text>
                </View>
                
                <View style={styles.habitInfo}>
                  <Text style={styles.habitName}>{habit.name}</Text>
                  <Text style={styles.habitCategory}>{habit.category}</Text>
                </View>
                
                <View style={styles.habitStats}>
                  <View style={styles.habitStat}>
                    <Text style={styles.habitStatNumber}>{habit.streak}</Text>
                    <Text style={styles.habitStatLabel}>Série</Text>
                  </View>
                  <View style={styles.habitStat}>
                    <Text style={styles.habitStatNumber}>{habit.completedDates.length}</Text>
                    <Text style={styles.habitStatLabel}>Total</Text>
                  </View>
                </View>
              </View>
            </Card>
          ))}

          {habits.length === 0 && (
            <Card style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                Aucune habitude à afficher
              </Text>
              <Text style={styles.emptyStateSubtext}>
                Commence par ajouter quelques habitudes pour voir tes statistiques
              </Text>
            </Card>
          )}
        </View>

        {/* Informations supplémentaires */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Résumé</Text>
          <Card>
            <View style={styles.summaryContent}>
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Calendar size={20} color="#00d4aa" />
                  <Text style={styles.summaryLabel}>Habitudes actives</Text>
                  <Text style={styles.summaryValue}>{habits.length}</Text>
                </View>
                <View style={styles.summaryItem}>
                  <TrendingUp size={20} color="#3b82f6" />
                  <Text style={styles.summaryLabel}>Série actuelle</Text>
                  <Text style={styles.summaryValue}>{getCurrentStreak()}</Text>
                </View>
              </View>
              
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Trophy size={20} color="#f59e0b" />
                  <Text style={styles.summaryLabel}>Meilleure série</Text>
                  <Text style={styles.summaryValue}>
                    {habits.length > 0 ? Math.max(...habits.map(h => h.streak)) : 0}
                  </Text>
                </View>
                <View style={styles.summaryItem}>
                  <Target size={20} color="#8b5cf6" />
                  <Text style={styles.summaryLabel}>Taux de réussite</Text>
                  <Text style={styles.summaryValue}>
                    {habits.length > 0 ? Math.round((getTotalCompletedHabits() / (habits.length * 30)) * 100) : 0}%
                  </Text>
                </View>
              </View>
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
  metricsSection: {
    marginBottom: 24,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    marginHorizontal: 4,
    padding: 20,
  },
  metricContent: {
    alignItems: 'center',
  },
  metricNumber: {
    color: '#ffffff',
    fontSize: 28,
    fontFamily: 'Poppins-Bold',
    marginTop: 8,
    marginBottom: 4,
  },
  metricLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
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
  chartContainer: {
    padding: 4,
  },
  chartHeader: {
    marginBottom: 20,
  },
  chartTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 4,
  },
  chartSubtitle: {
    color: '#9ca3af',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
  },
  chartBar: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  barContainer: {
    height: 80,
    width: 24,
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  bar: {
    width: '100%',
    borderRadius: 4,
    minHeight: 4,
  },
  barLabel: {
    color: '#9ca3af',
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    marginBottom: 2,
  },
  barValue: {
    color: '#ffffff',
    fontSize: 12,
    fontFamily: 'Inter-Bold',
  },
  habitCard: {
    marginBottom: 12,
  },
  habitContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  habitRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#00d4aa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  rankNumber: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  habitInfo: {
    flex: 1,
  },
  habitName: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 4,
  },
  habitCategory: {
    color: '#9ca3af',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textTransform: 'capitalize',
  },
  habitStats: {
    flexDirection: 'row',
    gap: 20,
  },
  habitStat: {
    alignItems: 'center',
  },
  habitStatNumber: {
    color: '#ffffff',
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
  },
  habitStatLabel: {
    color: '#9ca3af',
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyStateText: {
    color: '#ffffff',
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    color: '#9ca3af',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  summaryContent: {
    padding: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryLabel: {
    color: '#9ca3af',
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  summaryValue: {
    color: '#ffffff',
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
  },
});