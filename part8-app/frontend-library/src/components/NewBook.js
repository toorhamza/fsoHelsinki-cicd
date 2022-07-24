import React, { useState, useEffect } from 'react'
import { useMutation, useSubscription } from '@apollo/client'
import {ADD_BOOK,ALL_BOOKS,BOOK_ADDED} from '../queries.js'

const NewBook = (props) => {
  const [title, setTitle] = useState('The book')
  const [author, setAuhtor] = useState('Gonzales')
  const [published, setPublished] = useState(1958)
  const [genre, setGenre] = useState('')
  const [genres, setGenres] = useState(["science", "technology"])
  const [ createBook ] = useMutation(ADD_BOOK, {
    refetchQueries: [  {query: ALL_BOOKS} ]
  })

  const { loading, error, data } = useSubscription(
    BOOK_ADDED,
    {
      onSubscriptionData: ({ subscriptionData: { data } }) => {
        alert(data + "Added successfully")
      }
    },  
  )
  if (!props.show) {
    return null
  }

  const submit = async (event) => {
    event.preventDefault()

    createBook({  variables: { title, author, published, genres } })
  
    setTitle('')
    setPublished('')
    setAuhtor('')
    setGenres([])
    setGenre('')
  }

  const addGenre = () => {
    setGenres(genres.concat(genre))
    setGenre('')
  }

  return (
    <div>
      <form onSubmit={submit}>
        <div>
          title
          <input
            value={title}
            onChange={({ target }) => setTitle(target.value)}
          />
        </div>
        <div>
          author
          <input
            value={author}
            onChange={({ target }) => setAuhtor(target.value)}
          />
        </div>
        <div>
          published
          <input
            type='number'
            value={published}
            onChange={({ target }) => setPublished(target.value)}
          />
        </div>
        <div>
          <input
            value={genre}
            onChange={({ target }) => setGenre(target.value)}
          />
          <button onClick={addGenre} type="button">add genre</button>
        </div>
        <div>
          genres: {genres.join(' ')}
        </div>
        <button type='submit'>create book</button>
      </form>
    </div>
  )
}

export default NewBook