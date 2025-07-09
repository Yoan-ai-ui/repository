import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface CardProps {
  children: React.ReactNode;
  style?: any;
  onPress?: () => void;
  gradient?: boolean;
  colors?: string[];
}

export function Card({ 
  children, 
  style, 
  onPress, 
  gradient = false,
  colors = ['#2a2a2a', '#1a1a1a'] 
}: CardProps) {
  const CardComponent = onPress ? TouchableOpacity : View;

  if (gradient) {
    return (
      <CardComponent onPress={onPress} style={[styles.card, style]}>
        <LinearGradient
          colors={colors}
          style={styles.gradientCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {children}
        </LinearGradient>
      </CardComponent>
    );
  }

  return (
    <CardComponent onPress={onPress} style={[styles.card, style]}>
      {children}
    </CardComponent>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  gradientCard: {
    borderRadius: 16,
    padding: 20,
  },
});