export interface GroqResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export class GroqService {
  private apiKey: string;
  private apiUrl: string;

  constructor() {
    this.apiKey = process.env.EXPO_PUBLIC_GROQ_API_KEY || '';
    this.apiUrl = process.env.EXPO_PUBLIC_API_URL || '';
  }

  async generateDailyObjectives(userProfile: any): Promise<string[]> {
    const prompt = `Tu es un coach de développement personnel. Génère 3 objectifs quotidiens personnalisés pour cet utilisateur:
    
    Profil: ${JSON.stringify(userProfile)}
    
    Les objectifs doivent être:
    - Réalisables en une journée
    - Progressifs selon le niveau de l'utilisateur
    - Variés (physique, mental, productivité)
    - Motivants et précis
    
    Retourne uniquement une liste de 3 objectifs, un par ligne, sans numérotation.`;

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama3-8b-8192',
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 200,
        }),
      });

      const data: GroqResponse = await response.json();
      const objectives = data.choices[0]?.message?.content
        .split('\n')
        .filter(line => line.trim() !== '')
        .slice(0, 3);

      return objectives || [
        "Boire 8 verres d'eau aujourd'hui",
        "Méditer 10 minutes ce matin",
        "Lire 20 pages d'un livre inspirant"
      ];
    } catch (error) {
      console.error('Erreur Groq:', error);
      // Objectifs par défaut en cas d'erreur
      return [
        "Boire 8 verres d'eau aujourd'hui",
        "Méditer 10 minutes ce matin",
        "Lire 20 pages d'un livre inspirant"
      ];
    }
  }

  async generateMotivationalMessage(userStats: any): Promise<string> {
    const prompt = `Tu es un coach motivationnel. Crée un message personnalisé pour cet utilisateur basé sur ses statistiques:
    
    Stats: ${JSON.stringify(userStats)}
    
    Le message doit être:
    - Encourageant et positif
    - Basé sur ses progrès récents
    - Court (max 50 mots)
    - En français
    
    Retourne uniquement le message motivationnel.`;

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama3-8b-8192',
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.8,
          max_tokens: 100,
        }),
      });

      const data: GroqResponse = await response.json();
      return data.choices[0]?.message?.content || 'Continue comme ça, tu es sur la bonne voie !';
    } catch (error) {
      console.error('Erreur Groq:', error);
      return 'Continue comme ça, tu es sur la bonne voie !';
    }
  }
}