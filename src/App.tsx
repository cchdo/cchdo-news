import React, { useState } from "react";
import matter from "gray-matter";
import ReactMarkdown from "react-markdown";
import gfm from "remark-gfm";

const news = import.meta.glob("../news/*.md", { query: "?raw", import: "default", eager: true });

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
    // If either item is pinned, it should come first
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    // If both are pinned or both are unpinned, sort by date
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

const NewsItem = ({ contentMarkdown, date, title, pinned }: NewsDataType) => {
  return (
    <>
      <h5>
        {pinned && <i className="fa-solid fa-thumbtack text-primary" style={{ marginRight: '8px' }}></i>}
        {title}
      </h5>
      <small>{date}</small>
      <ReactMarkdown remarkPlugins={[gfm]}>{contentMarkdown}</ReactMarkdown>
    </>
  );
};

function App() {
  const allNewsData = getSortedNewsData();
  const itemsPerPage = 4;
  const [currentPage, setCurrentPage] = useState(0)

  const pageItemIndex = currentPage * itemsPerPage;
  const atPageOne = currentPage === 0;
  const atPageLast = allNewsData.length <= (pageItemIndex + itemsPerPage);
  return (
    <>
      {allNewsData.slice(pageItemIndex, pageItemIndex + itemsPerPage).map((newsData: NewsDataType, index: number) => {
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
      <ul className="pager">
        <li className={atPageLast ? "previous disabled" : "previous"}><a href="#" onClick={() => !atPageLast && setCurrentPage(currentPage + 1)}><span aria-hidden="true">&larr;</span> Older</a></li>
        <li className={atPageOne ? "next disabled" : "next"}><a href="#" onClick={() => !atPageOne && setCurrentPage(currentPage - 1)}>Newer <span aria-hidden="true">&rarr;</span></a></li>
      </ul>
    </>
  );
}

export default App;
