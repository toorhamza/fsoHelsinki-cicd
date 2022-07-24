import React, {useState} from "react";
import { useQuery, useMutation } from "@apollo/client";
import { ALL_AUTHOR, UPDATE_YEAR } from "../queries";

const Authors = (props) => {
  const authorResults = useQuery(ALL_AUTHOR);
  const [name, setName] = useState();
  const [year, setYear] = useState();
  const [ updateYear ] = useMutation(UPDATE_YEAR)


  if (!props.show) {
    return null;
  }

  const handleSubmit = e => {
    e.preventDefault();
    updateYear({variables: {name, year}})

  }

  const authors = authorResults.loading ? [] : authorResults.data.allAuthors;
  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {authors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>authors</h2>
      <form onSubmit={handleSubmit}>
      <select value={name} onChange={({ target }) => setName(target.value)}>    
        {authors.map(i => <option value={i.name}>{i.name}</option>)}        
          </select>
        <input
          value={year}
          onChange={({ target }) => setYear(Number(target.value))}
        />
        <button type="submit">Update</button>
      </form>
    </div>
  ); 
};

export default Authors;
