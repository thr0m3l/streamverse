export default function selectionFilter({ series, films } = []) {
    return {
      series: [
        { title: 'Drama', data: series?.filter((item) => item.NAME === 'Drama') },
        { title: 'Comedy', data: series?.filter((item) => item.NAME === 'Comedy') },
        { title: 'Children', data: series?.filter((item) => item.NAME === 'Kids') },
        { title: 'Animation', data: series?.filter((item) => item.NAME === 'Animation') },
        { title: 'Mystery', data: series?.filter((item) => item.NAME === 'Mystery') },
        { title: 'Documentary', data: series?.filter((item) => item.NAME === 'Documentary') },

      ],
      films: [
        { title: 'Adventure', data: films?.filter((item) => item.NAME === 'Adventure') },
        { title: 'Comedy', data: films?.filter((item) => item.NAME === 'Comedy') },
        { title: 'Sci-Fi', data: films?.filter((item) => item.NAME === 'Science Fiction') },
        { title: 'Fantasy', data: films?.filter((item) => item.NAME === 'Fantasy') },
        { title: 'Action', data: films?.filter((item) => item.NAME === 'Action') },
        { title: 'War', data: films?.filter((item) => item.NAME === 'War') },
        { title: 'Drama', data: films?.filter((item) => item.NAME === 'Drama') },
        { title: 'Thriller', data: films?.filter((item) => item.NAME === 'Thriller') }
      ],
    };
  }