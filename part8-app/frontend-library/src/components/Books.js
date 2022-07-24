import React, { useState } from 'react'
import {ALL_BOOKS} from "../queries"
import {useQuery } from '@apollo/client';



const Books = (props) => {
  const bookResults = useQuery(ALL_BOOKS)
  const [genre, setGenre] = useState("all")

  if (!props.show) {
    return null
  }

  const books = bookResults.loading ? [] : bookResults.data.allBooks
  const genres = books.length > 0 ? books.map(i => i.genres) : null
  const allGenres = genres instanceof Array ? genres.flatMap(i => i) : null

  return (
    <div>
      <h2>books</h2>

      <h3>sort by genre</h3>
      {allGenres instanceof Array ? allGenres.map(i=> <button onClick={()=>setGenre(i)}>{i}</button>):null}
      <button onClick={()=>setGenre("all")}>all genres</button>

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>
              author
            </th>
            <th>
              published
            </th>
          </tr>
          {genre === "all" ? books.map(a =>
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ): books.map(a => {
            let exist = a.genres.find(i => i == genre)
            if(exist) {
              return (
                <tr key={a.title}>
                <td>{a.title}</td>
                <td>{a.author.name}</td>
                <td>{a.published}</td>
              </tr>
              )} else {
                return null
              }
            }
          )}
        </tbody>
      </table>
    </div>
  )
}

export default Books