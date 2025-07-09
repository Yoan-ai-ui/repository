import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import { GradientBackground } from '@/components/ui/LinearGradient';
import { Card } from '@/components/ui/Card';
import { CircularProgress } from '@/components/ui/CircularProgress';
import { Plus, Calendar, Target, Flame, Clock } from 'lucide-react-native';
import { StorageService, Habit, UserProfile } from '@/services/storageService';

export default function Habits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [newHabitName, setNewHabitName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('santé');
  const [showAddHabit, setShowAddHabit] = useState(false);

  const categories = [
    { id: 'santé', name: 'Santé', color: '#00d4aa' },
    { id: 'productivité', name: 'Productivité', color: '#3b82f6' },
    { id: 'mindset', name: 'Mindset', color: '#8b5cf6' },
    { id: 'social', name: 'Social', color: '#f59e0b' },
    { id: 'créativité', name: 'Créativité', color: '#ec4899' },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const habitsData = await StorageService.getHabits();
      const profile = await StorageService.getUserProfile();
      
      setHabits(habitsData);
      setUserProfile(profile);
    } catch (error) {
      console.error('Erreur chargement habitudes:', error);
    }
  };

  const addHabit = async () => {
    if (!newHabitName.trim()) return;

    const newHabit: Habit = {
      id: `habit_${Date.now()}`,
      name: newHabitName.trim(),
      category: selectedCategory,
      streak: 0,
      completed: false,
      createdAt: new Date(),
      completedDates: []
    };

    const updatedHabits = [...habits, newHabit];
    setHabits(updatedHabits);
    await StorageService.saveHabits(updatedHabits);
    
    setNewHabitName('');
    setShowAddHabit(false);
  };

  const toggleHabit = async (habitId: string) => {
    const today = new Date().toISOString().split('T')[0];
    
    const updatedHabits = habits.map(habit => {
      if (habit.id === habitId) {
        const isCompleted = !habit.completed;
        const completedDates = isCompleted 
          ? [...habit.completedDates, today]
          : habit.completedDates.filter(date => date !== today);
        
        return {
          ...habit,
          completed: isCompleted,
          completedDates,
          streak: isCompleted ? habit.streak + 1 : Math.max(0, habit.streak - 1)
        };
      }
      return habit;
    });

    setHabits(updatedHabits);
    await StorageService.saveHabits(updatedHabits);

    // Récompenser l'utilisateur
    if (userProfile) {
      const completedHabit = habits.find(h => h.id === habitId);
      if (completedHabit && !completedHabit.completed) {
        const xpGain = 10;
        const newXp = userProfile.xp + xpGain;
        const newLevel = Math.floor(newXp / 100) + 1;
        
        const updatedProfile = {
          ...userProfile,
          xp: newXp,
          level: newLevel,
          totalXp: userProfile.totalXp + xpGain
        };
        
        setUserProfile(updatedProfile);
        await StorageService.saveUserProfile(updatedProfile);
      }
    }
  };

  const getCategoryColor = (category: string) => {
    return categories.find(cat => cat.id === category)?.color || '#00d4aa';
  };

  const getHabitProgress = (habit: Habit) => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    });

    const completedInLast7Days = last7Days.filter(date => 
      habit.completedDates.includes(date)
    ).length;

    return (completedInLast7Days / 7) * 100;
  };

  return (
    <GradientBackground>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Mes Habitudes</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setShowAddHabit(!showAddHabit)}
          >
            <Plus size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Formulaire d'ajout */}
        {showAddHabit && (
          <Card style={styles.addHabitCard}>
            <Text style={styles.addHabitTitle}>Nouvelle habitude</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Nom de l'habitude"
              placeholderTextColor="#9ca3af"
              value={newHabitName}
              onChangeText={setNewHabitName}
            />

            <View style={styles.categorySelector}>
              <Text style={styles.categoryTitle}>Catégorie</Text>
              <View style={styles.categoryOptions}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryOption,
                      selectedCategory === category.id && styles.selectedCategory,
                      { borderColor: category.color }
                    ]}
                    onPress={() => setSelectedCategory(category.id)}
                  >
                    <Text style={[
                      styles.categoryText,
                      selectedCategory === category.id && { color: category.color }
                    ]}>
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.addHabitButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowAddHabit(false)}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={addHabit}
              >
                <Text style={styles.saveButtonText}>Ajouter</Text>
              </TouchableOpacity>
            </View>
          </Card>
        )}

        {/* Statistiques des habitudes */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Aperçu</Text>
          <View style={styles.statsRow}>
            <Card style={styles.statCard}>
              <View style={styles.statContent}>
                <Target size={20} color="#00d4aa" />
                <Text style={styles.statNumber}>{habits.length}</Text>
                <Text style={styles.statLabel}>Habitudes</Text>
              </View>
            </Card>
            
            <Card style={styles.statCard}>
              <View style={styles.statContent}>
                <Flame size={20} color="#f59e0b" />
                <Text style={styles.statNumber}>
                  {Math.round(habits.reduce((acc, habit) => acc + habit.streak, 0) / (habits.length || 1))}
                </Text>
                <Text style={styles.statLabel}>Série moy.</Text>
              </View>
            </Card>
            
            <Card style={styles.statCard}>
              <View style={styles.statContent}>
                <Calendar size={20} color="#8b5cf6" />
                <Text style={styles.statNumber}>
                  {habits.filter(habit => habit.completed).length}
                </Text>
                <Text style={styles.statLabel}>Aujourd'hui</Text>
              </View>
            </Card>
          </View>
        </View>

        {/* Liste des habitudes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Habitudes actives</Text>
          
          {habits.map((habit) => (
            <Card key={habit.id} style={styles.habitCard}>
              <View style={styles.habitContent}>
                <View style={styles.habitInfo}>
                  <View style={styles.habitHeader}>
                    <Text style={styles.habitName}>{habit.name}</Text>
                    <View style={[
                      styles.categoryBadge,
                      { backgroundColor: getCategoryColor(habit.category) + '20' }
                    ]}>
                      <Text style={[
                        styles.categoryBadgeText,
                        { color: getCategoryColor(habit.category) }
                      ]}>
                        {categories.find(cat => cat.id === habit.category)?.name}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.habitStats}>
                    <View style={styles.habitStat}>
                      <Flame size={16} color="#f59e0b" />
                      <Text style={styles.habitStatText}>{habit.streak} jours</Text>
                    </View>
                    <View style={styles.habitStat}>
                      <Clock size={16} color="#9ca3af" />
                      <Text style={styles.habitStatText}>
                        {habit.completedDates.length} fois
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.habitProgress}>
                  <CircularProgress
                    progress={getHabitProgress(habit)}
                    size={60}
                    color={getCategoryColor(habit.category)}
                  >
                    <TouchableOpacity
                      style={[
                        styles.habitToggle,
                        habit.completed && styles.completedToggle,
                        { backgroundColor: getCategoryColor(habit.category) }
                      ]}
                      onPress={() => toggleHabit(habit.id)}
                    >
                      {habit.completed && (
                        <Text style={styles.checkmark}>✓</Text>
                      )}
                    </TouchableOpacity>
                  </CircularProgress>
                </View>
              </View>
            </Card>
          ))}

          {habits.length === 0 && (
            <Card style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                Aucune habitude pour le moment.
              </Text>
              <Text style={styles.emptyStateSubtext}>
                Commence par ajouter ta première habitude !
              </Text>
            </Card>
          )}
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
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#00d4aa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addHabitCard: {
    marginBottom: 24,
  },
  addHabitTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    marginBottom: 16,
  },
  categorySelector: {
    marginBottom: 20,
  },
  categoryTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 12,
  },
  categoryOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#4b5563',
  },
  selectedCategory: {
    backgroundColor: 'rgba(0, 212, 170, 0.1)',
  },
  categoryText: {
    color: '#9ca3af',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  addHabitButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#374151',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  saveButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#00d4aa',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  statsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 16,
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
  habitCard: {
    marginBottom: 16,
  },
  habitContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  habitInfo: {
    flex: 1,
  },
  habitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  habitName: {
    color: '#ffffff',
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    flex: 1,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 12,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  habitStats: {
    flexDirection: 'row',
    gap: 16,
  },
  habitStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  habitStatText: {
    color: '#9ca3af',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  habitProgress: {
    marginLeft: 20,
  },
  habitToggle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedToggle: {
    backgroundColor: '#00d4aa',
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 18,
    fontFamily: 'Inter-Bold',
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
});