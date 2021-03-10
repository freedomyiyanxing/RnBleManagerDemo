import React from 'react';
import { StyleSheet, View } from 'react-native';
import Ble from './ble/index';

const App = () => {
  return (
    <View style={styles.container}>
      <Ble />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
});

export default App;
