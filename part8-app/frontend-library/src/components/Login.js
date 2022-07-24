import React, { useState, useEffect } from "react";
import { useMutation } from "@apollo/client";
import { LOGIN } from "../queries";

const Login = ({ setError, setToken, show, parseJwt }) => {
  const [username, setUsername] = useState("user1");
  const [password, setPassword] = useState("secret");

  const [login, result] = useMutation(LOGIN, {
    onError: (error) => {
      setError(error.graphQLErrors[0].message);
    },
  });

  useEffect(() => {
    if (result.data) {
      const token = result.data.login.value;
      setToken(token);
      parseJwt(token)
      localStorage.setItem("token", token);
    }
  }, [result.data]); // eslint-disable-line

  if (!show) {
    return null;
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    login({ variables: { username, password } });
  };
  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginTop: "40px" }}>
        <label>username:</label>
        <input value={username} onChange={(e) => setUsername(e.target.value)} />
      </div>
      <div>
        <label>password:</label>
        <input value={password} type="password" onChange={(e) => setPassword(e.target.value)} />
      </div>
      <button type="submit">Login</button>
    </form>
  );
};

export default Login;
