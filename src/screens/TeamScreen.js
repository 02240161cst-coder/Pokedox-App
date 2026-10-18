 
import React from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useTeam } from '../context/TeamContext';

const BLUE = '#4263EB';

export default function TeamScreen() {
  const { team, ready, removeFromTeam } = useTeam();

  const totalStats = team.reduce(
    (totals, pokemon) => {
      (pokemon.stats || []).forEach((stat) => {
        const name = stat.stat.name;
        totals[name] = (totals[name] || 0) + stat.base_stat;
      });
      return totals;
    },
    {}
  );

  if (!ready) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={BLUE} />
        <Text style={styles.message}>Loading your team...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>My Team</Text>
      <Text style={styles.subtitle}>
        {team.length} / 6 Pokémon
      </Text>

      {team.length > 0 && (
        <View style={styles.statsBox}>
          <Text style={styles.statsTitle}>Combined Base Stats</Text>

          {[
            ['HP', 'hp'],
            ['Attack', 'attack'],
            ['Defense', 'defense'],
            ['Special Attack', 'special-attack'],
            ['Special Defense', 'special-defense'],
            ['Speed', 'speed'],
          ].map(([label, key]) => (
            <View style={styles.statRow} key={key}>
              <Text style={styles.statLabel}>{label}</Text>
              <Text style={styles.statValue}>
                {totalStats[key] || 0}
              </Text>
            </View>
          ))}
        </View>
      )}

      {team.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyEmoji}>⚡</Text>
          <Text style={styles.emptyTitle}>Your team is empty!</Text>
          <Text style={styles.message}>
            Open a Pokémon's detail page and tap "Add to My Team".
          </Text>
        </View>
      ) : (
        <FlatList
          data={team}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Image
                source={{
                  uri: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${item.id}.png`,
                }}
                style={styles.image}
              />

              <View style={styles.info}>
                <Text style={styles.number}>
                  #{String(item.id).padStart(3, '0')}
                </Text>
                <Text style={styles.name}>
                  {item.name.charAt(0).toUpperCase() +
                    item.name.slice(1)}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeFromTeam(item.id)}
              >
                <Text style={styles.removeText}>Remove</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FF',
    padding: 16,
    paddingTop: 80,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FF',
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#24356B',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
    marginBottom: 16,
  },
  statsBox: {
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 14,
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#24356B',
    marginBottom: 10,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEF5',
  },
  statLabel: {
    color: '#555',
    fontSize: 13,
  },
  statValue: {
    color: BLUE,
    fontWeight: 'bold',
  },
  emptyBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#24356B',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    marginTop: 8,
  },
  list: {
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 10,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    width: 76,
    height: 76,
  },
  info: {
    flex: 1,
    marginLeft: 10,
  },
  number: {
    fontSize: 12,
    color: '#888',
  },
  name: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#24356B',
    marginTop: 4,
  },
  removeButton: {
    backgroundColor: '#FDE8E8',
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 9,
  },
  removeText: {
    color: '#C62828',
    fontWeight: 'bold',
    fontSize: 12,
  },
});