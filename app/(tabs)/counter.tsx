import Button from "@components/Button";
import { useAppStore } from "@stores/useAppStore";
import { View, Text, StyleSheet } from "react-native";

const Counter = () => {
  const increment = useAppStore((state) => state.increment);
  const decrement = useAppStore((state) => state.decrement);
  const count = useAppStore((state) => state.count);

  return (
    <View style={styles.container}>
      <View style={styles.main}>
        <Text style={styles.title}>Counter</Text>
        <Text style={styles.subtitle}>This is the Counter page of your app.</Text>
        <View style={styles.countContainer}>
          <Button title="+" onPress={increment} />
          <Text style={styles.subtitle}>{count}</Text>
          <Button title="-" onPress={decrement} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 24,
  },
  main: {
    flex: 1,
    justifyContent: "center",
    maxWidth: 960,
    marginHorizontal: "auto",
  },
  title: {
    fontSize: 64,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 36,
    color: "#38434D",
  },
  countContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    gap: 16,
    marginTop: 16,
  },
});

export default Counter;
