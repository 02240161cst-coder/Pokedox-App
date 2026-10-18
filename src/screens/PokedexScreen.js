
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';

const API_URL = 'https://pokeapi.co/api/v2/pokemon';
const INITIAL_OFFSET = 160;
const PAGE_SIZE = 20;

export default function PokedexScreen() {
  const navigation = useNavigation();

  const [pokemon, setPokemon] = useState([]);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [offset, setOffset] = useState(INITIAL_OFFSET);

  useEffect(() => {
    loadPokemon(INITIAL_OFFSET, true);
  }, []);

  async function loadPokemon(start, reset = false) {
    if (loadingMore && !reset) return;

    if (reset) {
      setLoading(true);
      setError('');
    } else {
      setLoadingMore(true);
    }

    try {
      const response = await fetch(
        `${API_URL}?offset=${start}&limit=${PAGE_SIZE}`
      );

      if (!response.ok) {
        throw new Error('Could not load Pokemon.');
      }

      const data = await response.json();

      const newPokemon = data.results.map((item) => {
        const id = Number(
          item.url.split('/').filter(Boolean).pop()
        );

        return {
          id,
          name: item.name,
          image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
        };
      });

      setPokemon((previous) => {
        if (reset) return newPokemon;

        const existingIds = new Set(
          previous.map((item) => item.id)
        );

        return [
          ...previous,
          ...newPokemon.filter(
            (item) => !existingIds.has(item.id)
          ),
        ];
      });

      setOffset(start + PAGE_SIZE);
    } catch (err) {
      setError(
        'Unable to load Pokemon. Check your internet and try again.'
      );
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  useEffect(() => {
    let timer;

    if (!search.trim()) {
      setSearchResults(null);
      return;
    }

    timer = setTimeout(async () => {
      try {
        const response = await fetch(`${API_URL}?limit=1025`);

        if (!response.ok) {
          throw new Error('Search failed.');
        }

        const data = await response.json();
        const query = search.trim().toLowerCase();

        const matches = data.results
          .filter((item) => item.name.includes(query))
          .map((item) => {
            const id = Number(
              item.url.split('/').filter(Boolean).pop()
            );

            return {
              id,
              name: item.name,
              image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
            };
          });

        setSearchResults(matches);
      } catch (err) {
        setError('Search failed. Please try again.');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  function renderPokemon({ item }) {
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() =>
          navigation.navigate('Detail', { id: item.id })
        }
      >
        <Image
          source={{ uri: item.image }}
          style={styles.pokemonImage}
          resizeMode="contain"
        />

        <Text style={styles.pokemonNumber}>
          #{String(item.id).padStart(3, '0')}
        </Text>

        <Text style={styles.pokemonName}>
          {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
        </Text>
      </TouchableOpacity>
    );
  }

  const displayedPokemon =
    searchResults === null ? pokemon : searchResults;

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#4263EB" />
        <Text style={styles.message}>Loading your Pokedex...</Text>
      </SafeAreaView>
    );
  }

  if (error && pokemon.length === 0) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>

        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => loadPokemon(INITIAL_OFFSET, true)}
        >
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>POKEMON WORLD</Text>
        <Text style={styles.title}>Kunzang's Pokedex</Text>
        <Text style={styles.subtitle}>
          Discover your next favourite Pokemon.
        </Text>
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="Search all Pokemon..."
        placeholderTextColor="#8A94A6"
        value={search}
        onChangeText={setSearch}
        autoCapitalize="none"
        autoCorrect={false}
      />

      {error !== '' && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      {searchResults !== null && searchResults.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.message}>No Pokemon found.</Text>
        </View>
      ) : (
        <FlatList
          data={displayedPokemon}
          renderItem={renderPokemon}
          keyExtractor={(item) => String(item.id)}
          numColumns={2}
          contentContainerStyle={styles.list}
          columnWrapperStyle={styles.row}
          onEndReached={() => {
            if (
              searchResults === null &&
              !loadingMore &&
              !search.trim()
            ) {
              loadPokemon(offset);
            }
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator
                style={{ margin: 20 }}
                size="large"
                color="#4263EB"
              />
            ) : null
          }
          ListEmptyComponent={
            searchResults === null && !loading ? (
              <Text style={styles.message}>
                No Pokemon to display.
              </Text>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7FF',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 14,
  },
  eyebrow: {
    color: '#4263EB',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 6,
  },
  title: {
    color: '#172554',
    fontSize: 27,
    fontWeight: '800',
  },
  subtitle: {
    color: '#64748B',
    fontSize: 14,
    marginTop: 6,
  },
   
searchInput: {
  backgroundColor: '#FFFFFF',
  marginHorizontal: 20,
  marginBottom: 16,
  paddingHorizontal: 18,
  height: 50,
  borderRadius: 18,
  borderWidth: 1,
  borderColor: '#F0E1A5',
  fontSize: 15,
  color: '#3F3214',
},

  list: {
    paddingHorizontal: 14,
    paddingBottom: 24,
  },
  row: {
    justifyContent: 'space-between',
  },
   
card: {
  backgroundColor: '#FFFFFF',
  width: '48%',
  marginBottom: 16,
  borderRadius: 24,
  alignItems: 'center',
  padding: 12,
  borderWidth: 1,
  borderColor: '#F2E7C5',
  shadowColor: '#8A6D1D',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.08,
  shadowRadius: 8,
  elevation: 3,
},

  pokemonImage: {
    width: 125,
    height: 125,
  },
  pokemonNumber: {
    color: '#4263EB',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 6,
  },
  pokemonName: {
    color: '#172554',
    fontSize: 17,
    fontWeight: '700',
    marginTop: 4,
    marginBottom: 6,
  },
  center: {
    flex: 1,
    backgroundColor: '#F4F7FF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  message: {
    color: '#64748B',
    fontSize: 15,
    marginTop: 12,
    textAlign: 'center',
  },
  errorText: {
    color: '#DC2626',
    textAlign: 'center',
    margin: 12,
  },
  retryButton: {
    backgroundColor: '#4263EB',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 12,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});