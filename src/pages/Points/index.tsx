import React, { useState, useEffect } from 'react';
import { Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Feather as Icon } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import MapView, { Marker } from 'react-native-maps';
import { SvgUri } from 'react-native-svg';
import api from '../../services/api';
import * as Location from 'expo-location';

import styles from './styles';

interface Item {
  id: number;
  title: string;
  image_url: string;
}

interface Point {
  id: number;
  name: string;
  image: string;
  image_url: string;
  latitude: number;
  longitude: number;
}

const Points = () => {
  const navigation = useNavigation();

  const [ items, setItems ] = useState<Item[]>([]);
  const [ points, setPoints ] = useState<Point[]>([]);

  const [ selectedItems, setSelectedItems ] = useState<number[]>([]);

  const [ initialPosition, setInitialPosition ] = useState<[number, number]>([0, 0]);

  function handleSelectItem(id: number) {
    const alreadySelected = selectedItems.findIndex(item => item === id);

    if (alreadySelected >= 0) {
      const filteredItems = selectedItems.filter(item => item !== id);

      setSelectedItems(filteredItems);
    }
    else {
      setSelectedItems([...selectedItems, id]);
    }
  }

  useEffect(() => {
    api.get('items').then(response => {
      setItems(response.data.data);
    });
  }, []);

  useEffect(() => {
    async function loadPosition() {
      const { status } = await Location.requestPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Ooops...', 'Precisamos de sua permissão para obter a localização.');
        return;
      }

      const location = await Location.getCurrentPositionAsync();

      const { latitude, longitude } = location.coords;

      setInitialPosition([ latitude, longitude ]);
    }

    loadPosition();
  }, []);

  useEffect(() => {
    api.get('points', {
      params: {
        city: 'Santa Cruz de Salinas',
        UF: 'MG',
        items: selectedItems
      }
    }).then(response => {
      setPoints(response.data.data);
    });
  }, [selectedItems]);

  function navigateBack() {
    navigation.goBack();
  }

  function navigateToDetail(id: number) {
    navigation.navigate("Detail", { point_id: id });
  }

  return (
    <>
      <View style={styles.container}>
        <TouchableOpacity onPress={navigateBack}>
          <Icon name="arrow-left" size={20} color="#34cb79" />
        </TouchableOpacity>

        <Text style={styles.title}>Bem-vindo!</Text>
        <Text style={styles.description}>Encontre no mapa um ponto de coleta.</Text>

        <View style={styles.mapContainer}>
          {
            initialPosition[0] !== 0 && (
              <MapView
                style={styles.map}
                loadingEnabled={initialPosition[0] === 0}
                zoomControlEnabled={true}
                initialRegion={{
                  latitude: initialPosition[0],
                  longitude: initialPosition[1],
                  latitudeDelta: 0.014,
                  longitudeDelta: 0.014
                }}
              >
                { points.map(point => (
                  <Marker
                    key={String(point.id)}
                    style={styles.mapMarker}
                    onPress={() => navigateToDetail(point.id)}
                    coordinate={{
                      latitude: point.latitude,
                      longitude: point.longitude
                    }}
                  >
                    <View style={styles.mapMarkerContainer}>
                      <Image style={styles.mapMarkerImage} source={{ uri: point.image_url }} />
                      <Text style={styles.mapMarkerTitle}>
                        { point.name }
                      </Text>
                    </View>
                  </Marker>
                )) }
              </MapView>
            )
          }
        </View>
      </View>
      <View style={styles.itemsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 30 }}>
          { items.map(item => (
            <TouchableOpacity key={String(item.id)} onPress={() => handleSelectItem(item.id)} activeOpacity={0.6} style={ selectedItems.includes(item.id) ? [styles.item, styles.selectedItem] : [styles.item] } >
              <SvgUri width={42} height={42} uri={item.image_url} />
              <Text style={styles.itemTitle}>{item.title}</Text>
            </TouchableOpacity>
          )) }
        </ScrollView>
      </View>
    </>
  );
};

export default Points;