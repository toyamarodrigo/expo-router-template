import { Text, StyleSheet, Pressable, PressableProps } from "react-native";

interface ButtonProps extends PressableProps {
  onPress: () => void;
  title?: string;
}

const Button = ({ onPress, title = "Button", ...rest }: ButtonProps) => {
  return (
    <Pressable style={styles.button} onPress={onPress} {...rest}>
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 4,
    elevation: 3,
    backgroundColor: "black",
  },
  text: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "bold",
    letterSpacing: 0.25,
    color: "white",
  },
});

export default Button;
