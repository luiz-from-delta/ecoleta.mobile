import React, { useEffect, useState } from 'react';
import { Alert, Image, Linking, TouchableOpacity, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Feather as Icon, FontAwesome } from '@expo/vector-icons';
import { RectButton } from 'react-native-gesture-handler';
import api from '../../services/api';
import * as MailComposer from 'expo-mail-composer';

import styles from './styles';

interface Params {
  point_id: number;
}

interface Point {
  image: string;
  image_url: string;
  name: string;
  email: string;
  whatsapp: string;
  city: string;
  uf: string;
  items: {
    title: string;
  }[];
}

const Detail = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const routeParams = route.params as Params;

  const [ point, setPoint ] = useState<Point>({
    image: '',
    image_url: '',
    name: '',
    email: '',
    whatsapp: '',
    city: '',
    uf: '',
    items: []
  });

  useEffect(() => {
    api.get(`/points/${routeParams.point_id}`).then(response => {
      setPoint(response.data.data);
    });
  }, []);

  function navigateBack() {
    navigation.goBack();
  }

  function handleComposeMail() {
    MailComposer.composeAsync({
      subject: 'Interesse na coleta de resíduos',
      recipients: [ point.email ]
    });
  }

  function handleSendWhatsApp() {
    Linking.openURL(`whatsapp://send?phone=${point.whatsapp}&text=Tenho interesse sobre coleta de resíduos!`);
  }

  if (!point) {
    return null;
  }

  return (
    <>
      <View style={styles.container}>
        <TouchableOpacity onPress={navigateBack}>
          <Icon name="arrow-left" size={20} color="#34cb79" />
        </TouchableOpacity>

        <Image style={styles.pointImage} source={{ uri: point.image_url }} />

        <Text style={styles.pointName}>
          { point.name }
        </Text>
        <Text style={styles.pointItems}>{ point.items.map(item => item.title).join(', ') }</Text>

        <View style={styles.address}>
          <Text style={styles.addressTitle}>Endereço</Text>
          <Text style={styles.addressContent}>{ point.city }, { point.uf }</Text>
        </View>
      </View>
      <View style={styles.footer}>
        <RectButton style={styles.button} onPress={handleSendWhatsApp}>
          <FontAwesome name="whatsapp" size={20} color="#fff" />
          <Text style={styles.buttonText}>WhatsApp</Text>
        </RectButton>
        <RectButton style={styles.button} onPress={handleComposeMail}>
          <Icon name="mail" size={20} color="#fff" />
          <Text style={styles.buttonText}>E-mail</Text>
        </RectButton>
      </View>
    </>
  );
};

export default Detail;