## Exploring Early Christian Writings

This application allows you to explore the writings of early Christian leaders, also known as Church Fathers. It provides functionalities to:

* **See what Church Fathers wrote and how their writings connect to the Bible.**
* **Search through the Bible and Church Father writings.**

### Text Similarities

The "Text Similarities" section lets you explore how Church Father writings relate to the Bible. It offers two ways to view this relationship:

1. **Similarity Score:** This is a numerical value calculated using Google's text-embedding model `text-embedding-004`. It indicates how closely a Church Father's text relates to a specific Bible verse.
2. **Reference Type:** This indicates whether the Church Father's text directly cites the Bible verse or references it indirectly.

### Search

The "Search" section provides a powerful search functionality:

* Search through the NKJV Bible or all Church Father writings stored on this website.
* Leverage Google's `text-embedding-004` model and semantic search techniques. This allows you to search for meaning rather than exact phrasing. 

### Classification

The "Classification" section showcases the four different machine learning models trained for this application and the data used to train them.

### Add Text

The "Add Text" section allows you to:

* Add text from a Church Father.
* See a related Bible verse extracted automatically.
* Classify the added text.
* Parse the text and make it searchable through the search function.





## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.
