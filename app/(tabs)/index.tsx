import React, { useRef, useState } from 'react';
import { View, Button, Image, StyleSheet, Text, TouchableOpacity, Animated, AccessibilityInfo } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Speech from 'expo-speech';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { Ionicons } from '@expo/vector-icons';
 
const API_KEY = 'AIzaSyAHpRUyfbp6tM7r_cTH91SqBfQnq6iOsH8';

export default function HomeScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [audioReady, setAudioReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;

  const pickImage = async () => {
    clearAudio();
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: true,
    });
     
    if (!result.canceled) {
      setImage(result.assets[0].uri);
      analyzeImage(result.assets[0].base64);
      AccessibilityInfo.announceForAccessibility('Imagem selecionada. Analisando texto...');
    }
  };

  const analyzeImage = async (base64Image: string | null | undefined) => {
    try { 
      const response = await fetch(
        `https://vision.googleapis.com/v1/images:annotate?key=${API_KEY}`,
        {
          method: 'POST',
          body: JSON.stringify({
            requests: [
              {
                image: {
                  content: base64Image,
                },
                features: [
                  {
                    type: 'TEXT_DETECTION',
                    maxResults: 1,
                  },
                ],
              },
            ],
          }),
        }
      );
 
      const data = await response.json();  
      const detectedText = data.responses[0].fullTextAnnotation.text;
      setText(detectedText);
      AccessibilityInfo.announceForAccessibility('Texto detectado. Pronto para reprodução.');
    } 
    catch (error) { 
      console.error('Erro ao analisar imagem:', error);
      AccessibilityInfo.announceForAccessibility('Erro ao analisar a imagem. Por favor, tente novamente.');
    }
  };

  const playAudio = () => {
    if (text && !isPlaying) {
      Speech.speak(text, { 
        language: 'pt-BR', 
        rate: 1.5,
        onStart: () => {
          setIsPlaying(true);
          AccessibilityInfo.announceForAccessibility('Iniciando reprodução de áudio');
        },
        onDone: () => {
          setIsPlaying(false);
          AccessibilityInfo.announceForAccessibility('Reprodução de áudio concluída');
        },
      });
    }
  };

  const stopAudio = () => {
    Speech.stop();
    setIsPlaying(false);
    AccessibilityInfo.announceForAccessibility('Reprodução de áudio interrompida');
  };

  const clearAudio = () => {
    stopAudio();
    setText('');
    setImage(null);
    AccessibilityInfo.announceForAccessibility('Conteúdo limpo');
  };
 
  return (
    <View style={styles.container} accessibilityLabel="Tela principal"> 
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.button} 
          onPress={pickImage}
          accessible={true}
          accessibilityLabel="Escolher Imagem"
          accessibilityHint="Toque para selecionar uma imagem da galeria"
        >
          <Text style={styles.buttonText}>{"Escolher Imagem"}</Text>
        </TouchableOpacity>
      </View>
    
      {image && <Image 
        source={{ uri: image }} 
        style={styles.image} 
        accessible={true}
        accessibilityLabel="Imagem selecionada"
      />}
    
      {text ? (
        <View style={styles.audioContainer}>
          <TouchableOpacity 
            onPress={isPlaying ? stopAudio : playAudio} 
            style={styles.audioButton}
            accessible={true}
            accessibilityLabel={isPlaying ? "Parar áudio" : "Reproduzir áudio"}
            accessibilityHint={isPlaying ? "Toque para parar a reprodução do texto" : "Toque para ouvir o texto detectado"}
          >
            <Ionicons name={isPlaying ? "stop-circle" : "play-circle"} size={48} color={isPlaying ? "red" : "#4169E1"} />
          </TouchableOpacity>
          <Text style={styles.text} accessibilityLabel={isPlaying ? "Tocando áudio" : "Pronto para reprodução"}>
            {isPlaying ? "Tocando áudio..." : "Toque para ouvir o texto"}
          </Text> 
        </View>
      ) : (
        image && <Text style={styles.text} accessibilityLabel="Detectando texto">Detectando texto...</Text>
      )}
 
      {text && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.buttonClear} 
            onPress={clearAudio}
            accessible={true}
            accessibilityLabel="Limpar conteúdo"
            accessibilityHint="Toque para limpar a imagem e o texto detectado"
          >
            <Text style={styles.buttonText}>{"Limpar"}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 20,
  },
  image: {
    width: 300,
    height: 300,
    marginVertical: 20,
  },
  text: {
    marginTop: 20,
    fontSize: 18,
    textAlign: 'center',
  },
  audioContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: 20,
  },
  audioButton: {
    marginRight: 10,
  },
  waveContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  wave: {
    width: 8,
    height: 30,
    marginHorizontal: 4,
    backgroundColor: 'green',
    borderRadius: 4,
  },
  buttonContainer: {
    width: '100%',   // Faz o botão ocupar 100% da largura do contêiner
    paddingHorizontal: 20, // Espaçamento nas laterais
  },
  button: {
    backgroundColor: '#4169E1', // Cor do botão
    paddingVertical: 24,
    paddingHorizontal: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10, // Espaçamento acima e abaixo do botão 
    width: '100%', // O botão ocupa a largura total do contêiner
  },
  buttonClear: {
    backgroundColor: 'red', // Cor do botão
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10, // Espaçamento acima e abaixo do botão 
    width: '100%', // O botão ocupa a largura total do contêiner
  },
  buttonText: {
    color: 'white', // Cor do texto
    fontSize: 24,
    fontWeight: 'bold',
  },
});

