import { Text, View, StyleSheet, TextInput } from "react-native";
import { useForm, Resolver } from "react-hook-form";
import Constants from "expo-constants";
import Button from "@components/Button";

type FormValues = {
  user: string;
  password: string;
};

const resolver: Resolver<FormValues> = async (values) => {
  return {
    values: values.user ? values : {},
    errors: !values.user
      ? {
          user: {
            type: "required",
            message: "This is required.",
          },
          password: {
            type: "required",
            message: "This is required.",
          },
        }
      : {},
  };
};

const Login = () => {
  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver });
  const onSubmit = async (data: any) => {
    console.log("data", data);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Usuario</Text>
      <TextInput
        {...register("user")}
        style={styles.input}
        onChangeText={(text) => setValue("user", text)}
      />
      {errors.user && <Text style={{ color: "red" }}>{errors.user.message}</Text>}
      <Text style={styles.label}>Contraseña</Text>
      <TextInput
        {...register("password")}
        secureTextEntry
        style={styles.input}
        onChangeText={(text) => setValue("password", text)}
      />
      {errors.password && <Text style={{ color: "red" }}>{errors.password.message}</Text>}

      <View style={styles.buttonContainer}>
        <Button onPress={handleSubmit(onSubmit)} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    color: "white",
    margin: 20,
    marginLeft: 0,
  },
  buttonContainer: {
    paddingVertical: 16,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    paddingTop: Constants.statusBarHeight,
    padding: 8,
    backgroundColor: "#0e101c",
  },
  input: {
    backgroundColor: "white",
    height: 40,
    padding: 10,
    borderRadius: 4,
  },
});

export default Login;
