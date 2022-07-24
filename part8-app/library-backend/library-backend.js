const { ApolloServer, gql } = require("apollo-server");
const uuid = require("uuid/v1");
const mongoose = require("mongoose");
const Book = require("./model/books");
const Author = require("./model/author");
const User = require("./model/user");
const jwt = require("jsonwebtoken");
const { PubSub } = require('apollo-server')

const pubsub = new PubSub()

const JWT_SECRET = "testkey";

const MONGODB_URI = "mongodb+srv://admin:DQbeoSbBhfSGd8bT@cluster0.isy2k.mongodb.net/?retryWrites=true&w=majority";

console.log("connecting to", MONGODB_URI);

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
  .then(() => {
    console.log("connected to MongoDB");
  })
  .catch((error) => {
    console.log("error connection to MongoDB:", error.message);
  });

/*
 * It would be more sensible to assosiate book and the author by saving
 * the author id instead of the name to the book.
 * For simplicity we however save the author name.
 */

const authors = async () => await Author.find().lean(true);

const books = async () => await Book.find().lean(true);

const typeDefs = gql`
  type User {
    username: String!
    favoriteGenre: String!
    id: ID!
  }

  type Token {
    value: String!
  }

  type Book {
    title: String!
    published: Int!
    author: Author!
    _id: ID!
    genres: [String!]!
  }

  type Author {
    name: String!
    id: ID!
    born: Int
  }

  type allAuthor {
    name: String!
    born: Int
    bookCount: Int!
  }

  type Mutation {
    addBook(
      title: String!
      published: Int!
      author: String!
      genres: [String!]!
    ): [Book]
    editAuthor(name: String!, setBornTo: Int, id: Int): Author
    createUser(username: String!, favoriteGenre: String!): User
    login(username: String!, password: String!): Token
  }

  type Query {
    authors: [Author!]!
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book!]!
    allAuthors: [allAuthor!]!
    me: User
  }

  type Subscription {
    bookAdded: [Book]
  }
`;

const resolvers = {
  Query: {
    authors: async () => await authors(),
    bookCount: async () => await (await books()).length,
    authorCount: async () => await (await authors()).length,
    allBooks: async (root, args) => {
      const allBooks = await Book.find().populate("author").lean(true);
      const genreBooks = await Book.find({ genres: { $in: [args.genre] } })
        .populate("author")
        .lean(true);
      if (args.genre) {
        return genreBooks;
      }
      /*   const authorBooks = books.filter((o) => args.author ? o.author === args.author : o.author !== args.author)
      const genreBooks = books.filter((o) => args.genre ? o.genres.find(ob => {return args.genre === ob}) === args.genre : null)
      const bothParams = args.genre && args.author ? authorBooks.filter(o => o.genres.find(ob => {return args.genre === ob}) === args.genre) : null
      
      if (args.author && args.genre) {
        return bothParams
      } else if (args.author) {
        return authorBooks
      } else if (args.genre) {
        return genreBooks
      } else {
        return authorBooks
      } */
      return allBooks;
    },
    allAuthors: async () => {
      const fetchData = await Author.find().lean(true);
      const bookData = await Book.find().lean(true).populate("author");
      const authorNames = fetchData.map((o) => o.name);
      const authorsBorn = fetchData.map((o) => o.born);
      const bookCountWithAuthors = [];
      for (let i = 0; i < fetchData.length; i++) {
        var count = 0;
        let z = 0;
        while (z < bookData.length) {
          if (bookData[z].author.name == authorNames[i]) {
            count = count + 1;
          }
          z++;
        }
        const object = {
          name: authorNames[i],
          born: authorsBorn[i],
          bookCount: count,
        };
        bookCountWithAuthors.push(object);
      }

      return bookCountWithAuthors;
    },
    me: (root, args, context) => {
      return context.currentUser;
    },
  },
  Mutation: {
    addBook: async (root, args, context) => {
      const currentUser = context.currentUser;
      if (!currentUser) {
        throw new AuthenticationError("not authenticated");
      }
      try {
        const authorExist = await Author.find({ name: args.author }).lean(true);
        let added;
        if (authorExist.length === 0) {
          const newAuthor = {
            name: args.author,
            born: null,
          };
          added = await Author.create(newAuthor);
        }
        const id = authorExist.length > 0 ? authorExist[0]._id : added._id;
        const book = { ...args, author: id };
        await Book.create(book);
        
        const newBook = await Book.find({title: args.title}).populate("author").lean(true)
        await pubsub.publish('BOOK_ADDED', {bookAdded: newBook})
        return newBook;
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
          error: "Input is wrong or the book already exists",
        });
      }

    },
    editAuthor: async (root, args, context) => {
      const currentUser = context.currentUser;
      if (!currentUser) {
        throw new AuthenticationError("not authenticated");
      }
      try {
        const updateAuthor = await Author.findOneAndUpdate(
          { name: args.name },
          { $set: { born: args.setBornTo } },
          { returnOriginal: false }
        );
        if (updateAuthor === null) {
          throw new UserInputError(error.message, {
            invalidArgs: "Author not found",
          });
        }
        return updateAuthor;
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: "Author not found",
        });
      }

      /* 
      const author = authors.find(o => o.name === args.name)
      if (!author) {
        return null
      }

      const updatedAuthor = {...author, born: args.setBornTo}
      authors = authors.map(p => p.name === args.name ? updatedAuthor : p)
      return updatedAuthor */
    },
    createUser: (root, args) => {
      const user = new User({
        username: args.username,
        favouriteGenre: args.favoriteGenre,
      });

      return user.save().catch((error) => {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        });
      });
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username });

      if (!user || args.password !== "secret") {
        throw new UserInputError("wrong credentials");
      }

      const userForToken = {
        username: user.username,
        favouriteGenre: user.favouriteGenre,
        id: user._id,
      };

      return { value: jwt.sign(userForToken, JWT_SECRET) };
    },
  }, Subscription: {    
    bookAdded: {      
      subscribe: () => pubsub.asyncIterator(['BOOK_ADDED'])    
    },  
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null;
    if (auth && auth.toLowerCase().startsWith("bearer ")) {
      const decodedToken = jwt.verify(auth.substring(7), JWT_SECRET);
      const currentUser = await User.findById(decodedToken.id).populate(
        "friends"
      );
      return { currentUser };
    }
  },
});

server.listen().then(({ url, subscriptionsUrl }) => {
  console.log(`Server ready at ${url}`);
  console.log(`Subscriptions ready at ${subscriptionsUrl}`)
});