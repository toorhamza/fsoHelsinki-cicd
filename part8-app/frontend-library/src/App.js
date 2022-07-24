import React, { useEffect, useState } from "react";
import Authors from "./components/Authors";
import Books from "./components/Books";
import NewBook from "./components/NewBook";
import Login from "./components/Login";
import Recommendation from "./components/Recommendations"
import { useApolloClient } from '@apollo/client';

const App = ({tokens}) => {
  const [page, setPage] = useState("authors");
  const [token, setToken] = useState(tokens)
  const [user, setUser] = useState(null)
  const client = useApolloClient()

/*   useEffect(()=> {
    (async ()=> {
      const fetchToken = await localStorage.getItem('token')
      await setToken(fetchToken)
      await setUser(parseJwt(token))
      console.log(token)
      console.log(user)
    })()
    
  },[]) */

  const logout = () => {   
     setToken(null)   
      localStorage.clear()    
      client.resetStore()  
    }

    const parseJwt = (token) => {
      if (!token) { return; }
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace('-', '+').replace('_', '/');
      console.log(JSON.parse(window.atob(base64)))
      setUser(JSON.parse(window.atob(base64)));
  }

  return (
    <div>
      <div>
        <button onClick={() => setPage("authors")}>authors</button>
        <button onClick={() => setPage("books")}>books</button>
        {token ? <button onClick={() => setPage("add")}>add book</button> : null}
        {token ? <button onClick={() => setPage("recommend")}>recommendations</button> : null}
        {token ? null: <button onClick={() => setPage("login")}>login</button>}
        <button onClick={logout}>logout</button>

      </div>

      <Authors show={page === "authors"} />

      <Books show={page === "books"} />

      <NewBook show={page === "add"} />

      <Login show={page === "login"} setToken={setToken}
          parseJwt={parseJwt}/>

        <Recommendation show={page === "recommend"} genre={user ? user.favouriteGenre : ""} />
    </div>
  );
};

export default App;
