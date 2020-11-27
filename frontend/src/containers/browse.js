import React, { useState, useEffect, useContext } from 'react';
//import Fuse from 'fuse.js';
import { Card, Header, Loading, Player } from '../components';
import * as ROUTES from '../constants/routes';
import logo from '../logo.svg';
import { FooterContainer } from './footer';
import {AuthContext} from './../context/auth-context';
import { SelectProfileContainer } from './profiles';

export function BrowseContainer({ slides }) {
    const [category, setCategory] = useState('films');
    const [prevCategory, setPrevCategory] = useState('');
    const [profile, setProfile] = useState({});
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [slideRows, setSlideRows] = useState([]);    
    const auth = useContext(AuthContext); //auth context

    async function searchHandler (keyword){
        const url = `http://localhost:5000/api/browse/search/${keyword}`;
        const response = await fetch(url);
        const data = await response.json();
        console.log('searching');
        console.log(data);
        setSlideRows([{
          title: 'Search Results',
          data: data.results
        }]);
    }

    useEffect(() => {
      setTimeout(() => {
        setLoading(false);
      }, 3000);
    }, [profile.PROFILE_ID]);

    useEffect(() => {
      console.log(slides[category]);
      setSlideRows(slides[category]);
    }, [slides, category]);

    useEffect(() => {
      if (searchTerm.length === 1 && prevCategory === '') {
        setPrevCategory(category);
        setCategory('search');
        setSlideRows();
      }
      if (searchTerm.length === 0) setCategory('films');

      if (searchTerm.length >= 4) searchHandler(searchTerm);

    }, [searchTerm]);

    return profile.PROFILE_ID ? (
      <>
        {loading ? <Loading src = {'2'}/> : <Loading.ReleaseBody />}

         <Header src="joker1" dontShowOnSmallViewPort>
          <Header.Frame>
            <Header.Group>
              <Header.Logo to={ROUTES.BROWSE} src={logo} alt="Netflix" />
              <Header.TextLink active={category === 'series' ? 'true' : 'false'} onClick={() => {
                setCategory('series');
                setSearchTerm('')}}>
                Shows
              </Header.TextLink>
              <Header.TextLink active={category === 'films' ? 'true' : 'false'} onClick={() => setCategory('films')}>
                Movies
              </Header.TextLink>
            </Header.Group>
            <Header.Group>
              <Header.Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
              <Header.Profile>
                
                <Header.Picture src = {'2'}/>
                
                <Header.Dropdown>

                  <Header.Group>
                    <Header.Picture src = {'2'}/>
                    <Header.TextLink> {profile.PROFILE_ID} </Header.TextLink>
                  </Header.Group>

                  <Header.Group>
                    <Header.TextLink onClick = {() => auth.logout()}>
                       Sign Out
                    </Header.TextLink>
                  </Header.Group>

                </Header.Dropdown>
              </Header.Profile>
            </Header.Group>
          </Header.Frame>

          {category !== 'search' && <Header.Feature>
            <Header.FeatureCallOut>Watch Joker Now</Header.FeatureCallOut>
            <Header.Text>
              Forever alone in a crowd, failed comedian Arthur Fleck seeks connection as he walks the streets of Gotham
              City. Arthur wears two masks -- the one he paints for his day job as a clown, and the guise he projects in a
              futile attempt to feel like he's part of the world around him.
            </Header.Text>
            <Header.PlayButton> Play </Header.PlayButton>
          </Header.Feature>
          }

        </Header>

        <Card.Group>
            {slideRows && slideRows.map((slideItem)=>(
              <Card key={`${category}-${slideItem.title.toLowerCase()}`}>
                <Card.Title>{slideItem.title}</Card.Title>
                <Card.Entities>
              {slideItem.data.map((item) => (
                <Card.Item key={item.MOVIE_ID} item={item}>
                  <Card.Image src={`https://image.tmdb.org/t/p/w780${item.IMAGE_URL}`} />
                  <Card.Meta>
                    <Card.SubTitle>{item.TITLE}</Card.SubTitle>
                    <Card.Text>{item.DESCRIPTION}</Card.Text>
                    <Card.Text> {item.RATING}</Card.Text>
                  </Card.Meta>
                </Card.Item>
              ))}
            </Card.Entities>
            <Card.Feature category = {category}>
                <Player>
                  <Player.Button/>
                  <Player.Video src = "../../public/videos/bunny.mp4" />
                </Player>
            </Card.Feature>
            </Card>
            ))}
        </Card.Group>
      
        <FooterContainer />
      </>
    
    ) : (
      <> <SelectProfileContainer email = {auth.email} setProfile = {setProfile}/> </>
    );
}