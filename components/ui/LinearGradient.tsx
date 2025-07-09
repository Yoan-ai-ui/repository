import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet } from 'react-native';

interface GradientBackgroundProps {
  children: React.ReactNode;
  colors?: string[];
  style?: any;
}

export function GradientBackground({ 
  children, 
  colors = ['#0f0f0f', '#1a1a1a'], 
  style 
}: GradientBackgroundProps) {
  return (
    <LinearGradient
      colors={colors}
      style={[styles.gradient, style]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
});