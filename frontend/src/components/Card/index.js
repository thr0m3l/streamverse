import React, { useState, useContext, createContext, useEffect } from 'react';
import {AuthContext} from '../../context/auth-context';
import AddIcon from '@material-ui/icons/Add';
import ClearIcon from '@material-ui/icons/Clear';
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import ThumbDownIcon from '@material-ui/icons/ThumbDown';

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
  WatchList,
  Rating
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

Card.Rating = function CardRating ({children, ...restProps}){
  return <Rating {...restProps}> {children} </Rating>
}


Card.Feature = function CardFeature({ children, category, ...restProps }) {
  const { showFeature, itemFeature, setShowFeature } = useContext(FeatureContext);
  const auth = useContext(AuthContext);
  const [inWatchList, setInWatchList] = useState(false);
  const [isRated, setIsRated] = useState(false);
  const [rating, setRating] = useState(-1);

  async function fetchWatchInfo(){
    const body = JSON.stringify({
      EMAIL: auth.email,
      PROFILE_ID : auth.profile,
      MOVIE_ID: category === 'films' ? itemFeature.MOVIE_ID : null,
      SHOW_ID : category === 'series' ? itemFeature.SHOW_ID : null
    });

    console.log(body);
      try {
        const response = await fetch('http://localhost:5000/api/profiles/watchlist/find', {
          method: 'POST',
          headers: {
                'Content-Type' : 'application/json',
          },
          body: body
      });
      const responseData = await response.json();
      console.log(responseData);

      if(responseData.message === 'YES') setInWatchList(true);
      else if (responseData.message === 'NO') setInWatchList(false);

      } catch (err){
        console.log(err);
      }

  }

  useEffect(() => {
    fetchWatchInfo();
    getRating();
  }, [itemFeature, showFeature])

  

  async function postWatchInfo(event){
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

  async function ratingHandler (event, rating){
    try {
      const response = await fetch('http://localhost:5000/api/profiles/rating/add', {
        method: 'POST',
        headers: {
              'Content-Type' : 'application/json',
        },
        body: JSON.stringify({
          EMAIL: auth.email,
          PROFILE_ID : auth.profile,
          MOVIE_ID: category === 'films' ? itemFeature.MOVIE_ID : null,
          SHOW_ID : category === 'series' ? itemFeature.SHOW_ID : null,
          RATING : rating
        })
    });
    setIsRated(true);
    setRating(rating);
    } catch(err){
      console.log(err);
    }
    
  }

  async function getRating(){
    try {
      const response = await fetch('http://localhost:5000/api/profiles/rating/find', {
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

    const responseData = await response.json();

    console.log(responseData);

    setRating(responseData.rating);
    if (rating === -1) setIsRated(false);

    } catch (err){
      console.log(err);
    }
  }

  async function deleteFromWatchList (){
    const response = await fetch('http://localhost:5000/api/profiles/watchlist/delete', {
        method: 'DELETE',
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
    console.log(response.json());
    setInWatchList(false);
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
          {!inWatchList && <WatchList onClick = {e => postWatchInfo(e)}> 
              <AddIcon/>
          </WatchList>}
          {inWatchList && <WatchList onClick = {deleteFromWatchList} >
            <ClearIcon/>
          </WatchList>}
          
          { (!isRated || rating === 0) && 
            <Rating style = {{
            background : '#32a84c'
            }} onClick = {e => ratingHandler(e, 10)}>
            <ThumbUpIcon/>
          </Rating>
          }

          {(!isRated || rating === 10) && <Rating style= {{
            right : '500px',
            background : '#c41212'
          }} onClick = {e => ratingHandler(e, 0)}>
            <ThumbDownIcon/>
          </Rating>
          }
        </Group>

        {children}
      </Content>
    </Feature>
  ) : null;
};