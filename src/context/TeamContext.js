
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TeamContext = createContext();
const STORAGE_KEY = '@pokedex_team';

export function TeamProvider({ children }) {
  const [team, setTeam] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function loadTeam() {
      try {
        const savedTeam = await AsyncStorage.getItem(STORAGE_KEY);

        if (savedTeam) {
          setTeam(JSON.parse(savedTeam));
        }
      } catch (error) {
        console.log('Could not load saved team:', error);
      } finally {
        setReady(true);
      }
    }

    loadTeam();
  }, []);

  useEffect(() => {
    if (!ready) return;

    async function saveTeam() {
      try {
        await AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(team)
        );
      } catch (error) {
        console.log('Could not save team:', error);
      }
    }

    saveTeam();
  }, [team, ready]);

  function addToTeam(pokemon) {
    setTeam((currentTeam) => {
      if (currentTeam.some((member) => member.id === pokemon.id)) {
        return currentTeam;
      }

      if (currentTeam.length >= 6) {
        return currentTeam;
      }

      return [...currentTeam, pokemon];
    });
  }

  function removeFromTeam(id) {
    setTeam((currentTeam) =>
      currentTeam.filter((member) => member.id !== id)
    );
  }

  return (
    <TeamContext.Provider
      value={{
        team,
        ready,
        addToTeam,
        removeFromTeam,
      }}
    >
      {children}
    </TeamContext.Provider>
  );
}

export function useTeam() {
  return useContext(TeamContext);
}