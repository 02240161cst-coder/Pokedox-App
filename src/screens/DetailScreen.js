
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import { getPokemonDetails } from '../api';
import { useTeam } from '../context/TeamContext';

const STAT_NAMES = {
  hp: 'HP',
  attack: 'Attack',
  defense: 'Defense',
  'special-attack': 'Sp. Attack',
  'special-defense': 'Sp. Defense',
  speed: 'Speed',
};

export default function DetailScreen({ route }) {
  const { id } = route.params;
  const { team, ready, addToTeam, removeFromTeam } = useTeam();

  const [pokemon, setPokemon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadDetails() {
      setLoading(true);
      setError('');

      try {
        const data = await getPokemonDetails(id);
        if (active) setPokemon(data);
      } catch (err) {
        if (active) setError('Could not load details. Check your internet.');
      } finally {
        if (active) setLoading(false);
      }
    }

    loadDetails();

    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4263EB" />
        <Text style={styles.muted}>Loading Pokémon details...</Text>
      </View>
    );
  }

  if (error || !pokemon) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error || 'Pokémon not found.'}</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            setPokemon(null);
            setError('');
            setLoading(true);
            getPokemonDetails(id)
              .then(setPokemon)
              .catch(() => setError('Could not load details. Please retry.'))
              .finally(() => setLoading(false));
          }}
        >
          <Text style={styles.buttonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const officialArtwork =
    pokemon.sprites.other['official-artwork'].front_default ||
    pokemon.sprites.front_default;

  const isInTeam = team.some((member) => member.id === pokemon.id);
  const isFull = team.length >= 6;

   
function toggleTeam() {
  if (isInTeam) {
    removeFromTeam(pokemon.id);
  } else if (!isFull) {
    addToTeam({
      id: pokemon.id,
      name: pokemon.name,
      image: officialArtwork,
      stats: pokemon.stats,
    });
  }
}

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.number}>
          #{String(pokemon.id).padStart(3, '0')}
        </Text>

        <Image
          source={{ uri: officialArtwork }}
          style={styles.artwork}
          resizeMode="contain"
        />

        <Text style={styles.name}>
          {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
        </Text>

        <View style={styles.types}>
          {pokemon.types.map((item) => (
            <View key={item.type.name} style={styles.typeBadge}>
              <Text style={styles.typeText}>
                {item.type.name.toUpperCase()}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.measurements}>
          <View style={styles.measurement}>
            <Text style={styles.measurementValue}>
              {(pokemon.height / 10).toFixed(1)} m
            </Text>
            <Text style={styles.muted}>Height</Text>
          </View>

          <View style={styles.measurement}>
            <Text style={styles.measurementValue}>
              {(pokemon.weight / 10).toFixed(1)} kg
            </Text>
            <Text style={styles.muted}>Weight</Text>
          </View>
        </View>
      </View>

      <View style={styles.statsCard}>
        <Text style={styles.sectionTitle}>Base Stats</Text>

        {pokemon.stats.map((item) => (
          <View key={item.stat.name} style={styles.statRow}>
            <Text style={styles.statName}>
              {STAT_NAMES[item.stat.name] || item.stat.name}
            </Text>

            <Text style={styles.statValue}>{item.base_stat}</Text>

            <View style={styles.barBackground}>
              <View
                style={[
                  styles.barFill,
                  {
                    width: `${Math.min(item.base_stat / 255 * 100, 100)}%`,
                  },
                ]}
              />
            </View>
          </View>
        ))}
      </View>

      {!ready ? (
        <ActivityIndicator color="#4263EB" style={{ marginTop: 20 }} />
      ) : (
        <TouchableOpacity
          style={[
            styles.button,
            isInTeam && styles.removeButton,
            isFull && !isInTeam && styles.disabledButton,
          ]}
          onPress={toggleTeam}
          disabled={isFull && !isInTeam}
        >
          <Text style={styles.buttonText}>
            {isInTeam
              ? 'Remove from My Team'
              : isFull
                ? 'Team Full (6/6)'
                : '+ Add to My Team'}
          </Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7FF',
  },
  content: {
    padding: 18,
    paddingBottom: 32,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F4F7FF',
    padding: 24,
  },
  hero: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    alignItems: 'center',
    padding: 20,
  },
  number: {
    color: '#4263EB',
    fontWeight: '800',
    fontSize: 15,
  },
  artwork: {
    width: 210,
    height: 210,
    marginVertical: 8,
  },
  name: {
    fontSize: 29,
    fontWeight: '800',
    color: '#172554',
  },
  types: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  typeBadge: {
    backgroundColor: '#DCE5FF',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  typeText: {
    color: '#3154C8',
    fontSize: 11,
    fontWeight: '800',
  },
  measurements: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 22,
  },
  measurement: {
    alignItems: 'center',
    minWidth: 100,
  },
  measurementValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#172554',
  },
  muted: {
    color: '#64748B',
    marginTop: 6,
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#172554',
    marginBottom: 18,
  },
  statRow: {
    marginBottom: 15,
  },
  statName: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '600',
  },
  statValue: {
    position: 'absolute',
    right: 0,
    top: 0,
    color: '#172554',
    fontWeight: '800',
  },
  barBackground: {
    height: 8,
    backgroundColor: '#E7ECF6',
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 8,
  },
  barFill: {
    height: 8,
    backgroundColor: '#4263EB',
    borderRadius: 8,
  },
  button: {
    backgroundColor: '#4263EB',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginTop: 18,
  },
  removeButton: {
    backgroundColor: '#DC5252',
  },
  disabledButton: {
    backgroundColor: '#94A3B8',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
  error: {
    color: '#DC2626',
    textAlign: 'center',
  },
});