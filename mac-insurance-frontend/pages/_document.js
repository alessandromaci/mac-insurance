import Document, { Html, Head, Main, NextScript } from "next/document";

export default class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head />
        <body>
          <Main />
          <div id="supply-modal" />
          <div id="request-modal" />
          <div id="dashboard-modal" />
          <NextScript />
        </body>
      </Html>
    );
  }
}
