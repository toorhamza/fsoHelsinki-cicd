import React, { useEffect, useState } from "react";
import { RECOMMEND_BOOKS } from "../queries";
import { useLazyQuery } from "@apollo/client";

const RecommendationComponent = ({ show, genre }) => {
  const [loadBooks, { called, loading, data }] = useLazyQuery(RECOMMEND_BOOKS);
  const [recommendations, setRecommendations] = useState();
  const [load, setLoad] = useState(null);

  useEffect(() => {
    loadBooks({ variables: { genre } })
  }, [show]);

  if (!show) {
    return null;
  }

  /*   const books = bookResults.loading ? [] : bookResults.data.allBooks
  const genres = books.length > 0 ? books.map(i => i.genres) : null */

  return (
    <div>
      <h2>Recommended books</h2>

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {genre === "" ? (
            <p>Please add your favourite genre</p>
          ) : null}
          { data && data.allBooks instanceof Array ? (
            data.allBooks.map((a) => (
              <tr key={a.title}>
                <td>{a.title}</td>
                <td>{a.author.name}</td>
                <td>{a.published}</td>
              </tr>
            ))
          ) :null}
        </tbody>
      </table>
    </div>
  );
};

export default RecommendationComponent;
