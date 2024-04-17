import React from "react";
import matter from "gray-matter";
import ReactMarkdown from "react-markdown";
import gfm from "remark-gfm";

const news = import.meta.glob("../news/*.md", { as: "raw", eager: true });

export type NewsDataType = {
  id: string;
  [key: string]: any;
};

export function getSortedNewsData() {
  const allNewssData = Object.entries(news).map(
    ([fileName, fileContents]): NewsDataType => {
      // Remove ".md" from file name to get id
      const id = fileName.replace(/\.md$/, "");

      // Use gray-matter to parse the post metadata section
      const matterResult = matter(fileContents);
      const contentMarkdown = matterResult.content;

      // Combine the data with the id
      return {
        id,
        contentMarkdown,
        ...matterResult.data,
      };
    }
  );
  // Sort posts by date
  return allNewssData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

const NewsItem = ({ contentMarkdown, date, title }: NewsDataType) => {
  return (
    <>
      <h5>{title}</h5>
      <small>{date}</small>
      <ReactMarkdown remarkPlugins={[gfm]}>{contentMarkdown}</ReactMarkdown>
    </>
  );
};

function App() {
  const allNewsData = getSortedNewsData();
  return (
    <>
      {allNewsData.slice(0, 4).map((newsData: NewsDataType, index: number) => {
        return index === 3 ? (
          <React.Fragment key={newsData.id}>
            <NewsItem {...newsData} />
          </React.Fragment>
        ) : (
          <React.Fragment key={newsData.id}>
            <NewsItem {...newsData} />
            <hr />
          </React.Fragment>
        );
      })}
    </>
  );
}

export default App;
