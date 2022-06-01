import { ApolloClient, InMemoryCache } from "@apollo/client";

const client = new ApolloClient({
  uri: "https://api.studio.thegraph.com/query/27357/mac-insurance/v0.8",
  cache: new InMemoryCache(),
});

export default client;
