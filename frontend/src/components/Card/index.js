import React, { useState, useContext, createContext, useEffect } from 'react';
import {AuthContext} from '../../context/auth-context';

import {
  Container,
  Group,
  Title,
  SubTitle,
  Text,
  Feature,
  FeatureTitle,
  FeatureText,
  FeatureClose,
  Maturity,
  Content,
  Meta,
  Entities,
  Item,
  Image,
  WatchList
} from './styles/card';

export const FeatureContext = createContext();

export default function Card({ children, ...restProps }) {
  const [showFeature, setShowFeature] = useState(false);
  const [itemFeature, setItemFeature] = useState({});

  return (
    <FeatureContext.Provider value={{ showFeature, setShowFeature, itemFeature, setItemFeature }}>
      <Container {...restProps}>{children}</Container>
    </FeatureContext.Provider>
  );
}

Card.Group = function CardGroup({ children, ...restProps }) {
  return <Group {...restProps}>{children}</Group>;
};

Card.Title = function CardTitle({ children, ...restProps }) {
  return <Title {...restProps}>{children}</Title>;
};

Card.SubTitle = function CardSubTitle({ children, ...restProps }) {
  return <SubTitle {...restProps}>{children}</SubTitle>;
};

Card.Text = function CardText({ children, ...restProps }) {
  return <Text {...restProps}>{children}</Text>;
};

Card.Entities = function CardEntities({ children, ...restProps }) {
  return <Entities {...restProps}>{children}</Entities>;
};

Card.Meta = function CardMeta({ children, ...restProps }) {
  return <Meta {...restProps}>{children}</Meta>;
};

Card.Item = function CardItem({ item, children, ...restProps }) {
  const { setShowFeature, setItemFeature } = useContext(FeatureContext);

  return (
    <Item
      onClick={() => {
        setItemFeature(item);
        setShowFeature(true);
      }}
      {...restProps}
    >
      {children}
    </Item>
  );
};

Card.Image = function CardImage({ ...restProps }) {
  return <Image {...restProps} />;
};

Card.WatchList = function CardWatchList ({children, ...restProps}){
  return <WatchList {...restProps}> {children} </WatchList>
}

Card.Feature = function CardFeature({ children, category, ...restProps }) {
  const { showFeature, itemFeature, setShowFeature } = useContext(FeatureContext);
  const auth = useContext(AuthContext);
  const [inWatchList, setInWatchList] = useState(false);
  

  async function fetchWatchInfo(){
    const response = await fetch('http://localhost:5000/api/profiles/watchlist/find', {
        method: 'POST',
        headers: {
              'Content-Type' : 'application/json',
        },
        body: JSON.stringify({
          EMAIL: auth.email,
          PROFILE_ID : auth.profile,
          MOVIE_ID: category === 'films' ? itemFeature.MOVIE_ID : null,
          SHOW_ID : category === 'series' ? itemFeature.SHOW_ID : null
        })
    });
    console.log(response.result);

    if(response.result && response.result.length > 0) setInWatchList(true);
    else setInWatchList(false);
  }

  useEffect(() => {
    fetchWatchInfo();
  }, [itemFeature])

  

  async function postWatchInfo(){
    const response = await fetch('http://localhost:5000/api/profiles/watchlist/add', {
        method: 'POST',
        headers: {
              'Content-Type' : 'application/json',
        },
        body: JSON.stringify({
          EMAIL: auth.email,
          PROFILE_ID : auth.profile,
          MOVIE_ID: category === 'films' ? itemFeature.MOVIE_ID : null,
          SHOW_ID : category === 'series' ? itemFeature.SHOW_ID : null
        })
    });
    console.log(response);
    setInWatchList(true);
  }


  return showFeature ? (
    <Feature {...restProps} src={`https://image.tmdb.org/t/p/w1280${itemFeature.IMAGE_URL}`}>
      <Content>
        <FeatureTitle>{itemFeature.TITLE}</FeatureTitle>
        <FeatureText>{itemFeature.DESCRIPTION}</FeatureText>
        <FeatureText> {'Rating: ' + itemFeature.RATING}</FeatureText>
        <FeatureClose onClick={() => setShowFeature(false)}>
          <img src="/images/icons/close.png" alt="Close" />
        </FeatureClose>

        <Group margin="30px 0" flexDirection="row" alignItems="center">
        <Maturity rating={itemFeature.MATURITY_RATING}>{itemFeature.MATURITY_RATING}</Maturity>
          <FeatureText fontWeight="bold">
            {itemFeature.NAME}
          </FeatureText>
          <WatchList onClick = {postWatchInfo}>
            {!inWatchList && 'Add to Watchlist'}
            {inWatchList && 'Added to watchlist'}
          </WatchList>
        </Group>

        {children}
      </Content>
    </Feature>
  ) : null;
};