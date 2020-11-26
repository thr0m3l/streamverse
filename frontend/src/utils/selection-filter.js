export default function selectionFilter({ series, films } = []) {
    return {
      series: [
        { title: 'Documentaries', data: series?.filter((item) => item.NAME === 'documentaries') },
        { title: 'Comedies', data: series?.filter((item) => item.NAME === 'comedies') },
        { title: 'Children', data: series?.filter((item) => item.NAME === 'children') },
        { title: 'Crime', data: series?.filter((item) => item.NAME === 'crime') },
        { title: 'Feel Good', data: series?.filter((item) => item.NAME === 'feel-good') },
      ],
      films: [
        { title: 'Adventure', data: films?.filter((item) => item.NAME === 'Adventure') },
        { title: 'Comedy', data: films?.filter((item) => item.NAME === 'Comedy') },
        { title: 'Sci-Fi', data: films?.filter((item) => item.NAME === 'Science Fiction') },
        { title: 'Fantasy', data: films?.filter((item) => item.NAME === 'Fantasy') },
        { title: 'War', data: films?.filter((item) => item.NAME === 'War') },
      ],
    };
  }