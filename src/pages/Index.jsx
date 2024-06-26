import React, { useState, useEffect } from "react";
import { Box, Text, Button, VStack, Heading, Image } from "@chakra-ui/react";
import { FaMicrophone } from "react-icons/fa";

const Index = () => {
  const [audioContext, setAudioContext] = useState(null);
  const [analyser, setAnalyser] = useState(null);
  const [animationId, setAnimationId] = useState(null);
  const [dominantFreq, setDominantFreq] = useState(0);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    // Cleanup on component unmount
    return () => {
      if (audioContext) {
        audioContext.close();
      }
      cancelAnimationFrame(animationId);
    };
  }, [audioContext, animationId]);

  const startListening = async () => {
    if (audioContext && isListening) {
      return;
    }

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const newAudioContext = new AudioContext();
    const newAnalyser = newAudioContext.createAnalyser();
    newAnalyser.fftSize = 2048;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const source = newAudioContext.createMediaStreamSource(stream);
      source.connect(newAnalyser);

      setAudioContext(newAudioContext);
      setAnalyser(newAnalyser);
      setIsListening(true);
      animate();
    } catch (error) {
      console.error("Error accessing audio devices.", error);
    }
  };

  const stopListening = () => {
    if (audioContext) {
      audioContext.close();
      setAudioContext(null);
      setIsListening(false);
      cancelAnimationFrame(animationId);
    }
  };

  const calculateEqualTemperamentFrequency = (freq) => {
    const n = Math.round(12 * Math.log2(freq / 440));
    return 440 * Math.pow(2, n / 12);
  };

  const animate = () => {
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    let maxIndex = 0;
    let maxValue = 0;
    for (let i = 0; i < bufferLength; i++) {
      if (dataArray[i] > maxValue) {
        maxValue = dataArray[i];
        maxIndex = i;
      }
    }

    const freq = (maxIndex * audioContext.sampleRate) / analyser.fftSize;
    const roundedFreq = calculateEqualTemperamentFrequency(freq);
    setDominantFreq(roundedFreq);

    const newAnimationId = requestAnimationFrame(animate);
    setAnimationId(newAnimationId);
  };

  return (
    <VStack spacing={4} align="center" justify="center" height="100vh">
      <Heading mb={4}>Audio Frequency Detector</Heading>
      <Text fontSize="xl">Dominant Frequency: {dominantFreq.toFixed(2)} Hz</Text>
      <Box>
        {isListening ? (
          <Button colorScheme="red" onClick={stopListening} leftIcon={<FaMicrophone />}>
            Stop
          </Button>
        ) : (
          <Button colorScheme="green" onClick={startListening} leftIcon={<FaMicrophone />}>
            Start
          </Button>
        )}
      </Box>
      <Image src="https://via.placeholder.com/640x480.png?text=Piano+Keyboard" alt="Piano Keyboard" />
    </VStack>
  );
};

export default Index;
