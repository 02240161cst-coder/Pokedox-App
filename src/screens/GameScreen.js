
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
} from 'react-native';

const BLUE = '#4263EB';

export default function GameScreen() {
  const [pokemon, setPokemon] = useState(null);
  const [choices, setChoices] = useState([]);
  const [answer, setAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [hint, setHint] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadQuestion() {
    setLoading(true);
    setError('');
    setAnswer(null);
    setHint(false);

    try {
      const correctId = Math.floor(Math.random() * 151) + 1;

      const otherIds = new Set();
      while (otherIds.size < 3) {
        const id = Math.floor(Math.random() * 151) + 1;
        if (id !== correctId) otherIds.add(id);
      }

      const ids = [
        correctId,
        ...Array.from(otherIds),
      ].sort(() => Math.random() - 0.5);

      const results = await Promise.all(
        ids.map(async (id) => {
          const response = await fetch(
            `https://pokeapi.co/api/v2/pokemon/${id}`
          );

          if (!response.ok) {
            throw new Error('Could not load Pokémon.');
          }

          const data = await response.json();

          return {
            id: data.id,
            name: data.name,
            image:
              data.sprites.other['official-artwork'].front_default ||
              data.sprites.front_default,
            types: data.types.map((item) => item.type.name),
          };
        })
      );

      const correctPokemon = results.find(
        (item) => item.id === correctId
      );

      setPokemon(correctPokemon);
      setChoices(results);
    } catch (err) {
      setError('Could not load the question. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadQuestion();
  }, []);

  function chooseAnswer(choice) {
    if (answer !== null || !pokemon) return;

    setAnswer(choice.id);

    if (choice.id === pokemon.id) {
      setScore((current) => current + 1);
      setStreak((current) => {
        const next = current + 1;
        setBestStreak((best) => Math.max(best, next));
        return next;
      });
    } else {
      setStreak(0);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={BLUE} />
        <Text style={styles.subtitle}>Preparing your question...</Text>
      </View>
    );
  }

  if (error || !pokemon) {
    return (
      <View style={styles.center}>
        <Text style={styles.subtitle}>
          {error || 'Something went wrong.'}
        </Text>
        <TouchableOpacity
          style={styles.nextButton}
          onPress={loadQuestion}
        >
          <Text style={styles.nextText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const answered = answer !== null;
  const correct = answer === pokemon.id;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Who's That Pokémon?</Text>
      <Text style={styles.subtitle}>
        Can you identify the mystery Pokémon?
      </Text>

      <View style={styles.scoreRow}>
        <View style={styles.scoreCard}>
          <Text style={styles.scoreNumber}>{score}</Text>
          <Text style={styles.scoreLabel}>Score</Text>
        </View>

        <View style={styles.scoreCard}>
          <Text style={styles.scoreNumber}>{streak}</Text>
          <Text style={styles.scoreLabel}>Streak</Text>
        </View>

        <View style={styles.scoreCard}>
          <Text style={styles.scoreNumber}>{bestStreak}</Text>
          <Text style={styles.scoreLabel}>Best</Text>
        </View>
      </View>

      <View style={styles.pokemonBox}>
        <Image
          source={{ uri: pokemon.image }}
          style={[
            styles.pokemonImage,
            !answered && styles.silhouette,
          ]}
          resizeMode="contain"
        />

        <Text style={styles.mysteryText}>
          {answered
            ? pokemon.name.toUpperCase()
            : 'WHO IS THIS POKÉMON?'}
        </Text>
      </View>

      {!answered && (
        <TouchableOpacity
          style={styles.hintButton}
          onPress={() => setHint(true)}
        >
          <Text style={styles.hintText}>
            {hint
              ? `Hint: Type ${pokemon.types.join(' / ')}`
              : '💡 Show Hint'}
          </Text>
        </TouchableOpacity>
      )}

      <Text style={styles.chooseTitle}>Choose your answer</Text>

      {choices.map((choice) => {
        let buttonColor = '#FFFFFF';

        if (answered && choice.id === pokemon.id) {
          buttonColor = '#D9FBE5';
        } else if (
          answered &&
          choice.id === answer &&
          choice.id !== pokemon.id
        ) {
          buttonColor = '#FFE0E0';
        }

        return (
          <TouchableOpacity
            key={choice.id}
            style={[
              styles.choiceButton,
              { backgroundColor: buttonColor },
            ]}
            disabled={answered}
            onPress={() => chooseAnswer(choice)}
          >
            <Text style={styles.choiceText}>
              {choice.name.charAt(0).toUpperCase() +
                choice.name.slice(1)}
            </Text>
          </TouchableOpacity>
        );
      })}

      {answered && (
        <View style={styles.resultBox}>
          <Text style={styles.resultText}>
            {correct ? '🎉 Correct! Well done!' : '❌ Not quite!'}
          </Text>

          <Text style={styles.subtitle}>
            The answer is {pokemon.name.charAt(0).toUpperCase() +
              pokemon.name.slice(1)}.
          </Text>

          <TouchableOpacity
            style={styles.nextButton}
            onPress={loadQuestion}
          >
            <Text style={styles.nextText}>Next Pokémon →</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F5F7FF',
    padding: 18,
    paddingTop: 80,
    paddingBottom: 30,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F5F7FF',
  },
  heading: {
    fontSize: 25,
    fontWeight: '800',
    color: '#24356B',
    textAlign: 'center',
  },
  subtitle: {
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
  },
  scoreRow: {
    flexDirection: 'row',
    gap: 10,
    marginVertical: 18,
  },
  scoreCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    alignItems: 'center',
    padding: 12,
  },
  scoreNumber: {
    color: BLUE,
    fontSize: 23,
    fontWeight: '800',
  },
  scoreLabel: {
    color: '#64748B',
    marginTop: 3,
  },
  pokemonBox: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 14,
  },
  pokemonImage: {
    width: 210,
    height: 210,
  },
  silhouette: {
    tintColor: '#111827',
  },
  mysteryText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#24356B',
    marginTop: 8,
    textAlign: 'center',
  },
  hintButton: {
    backgroundColor: '#FFF2CC',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  hintText: {
    color: '#805A00',
    fontWeight: '700',
  },
  chooseTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#24356B',
    marginTop: 20,
    marginBottom: 10,
  },
  choiceButton: {
    borderWidth: 1,
    borderColor: '#DCE3F5',
    borderRadius: 12,
    padding: 14,
    marginBottom: 9,
  },
  choiceText: {
    color: '#24356B',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  resultBox: {
    alignItems: 'center',
    marginTop: 14,
  },
  resultText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#24356B',
    textAlign: 'center',
  },
  nextButton: {
    backgroundColor: BLUE,
    padding: 15,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 14,
    width: '100%',
  },
  nextText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});