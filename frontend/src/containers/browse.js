import React, { useState, useEffect, useContext, Component } from 'react';
import { Card, Header, Loading, Player } from '../components';
import * as ROUTES from '../constants/routes';
import logo from '../logo.svg';
import { FooterContainer } from './footer';
import {AuthContext} from './../context/auth-context';
import { SelectProfileContainer } from './profiles';
import {useHistory} from 'react-router-dom';

// import Select from '@material-ui/core/Select';

export function BrowseContainer({ slides }) {
    const [category, setCategory] = useState('');
    const [prevCategory, setPrevCategory] = useState('');
    const [profile, setProfile] = useState({});
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [slideRows, setSlideRows] = useState([]);
    const [profiles, setProfiles] = useState([]);    
    const auth = useContext(AuthContext); //auth context
    const history = useHistory();

    

    
    async function searchHandler (keyword){
        const searchKey = keyword.split(':');
        let key, param, ss;
        if (searchKey.length === 1){
          key = searchKey[0];
          param = ss = 'all';
        } else if (searchKey.length === 2){
          key = searchKey[1];
          ss = 'all';
          param = searchKey[0];
        } else {
          ss = searchKey[0];
          param = searchKey[1];
          key = searchKey[2];
        }
        console.log(ss, param, key);
        const url = `http://localhost:5000/api/browse/search/?kw=${key}&param=${param}&ss=${ss}`;
        const response = await fetch(url);
        const data = await response.json();
        console.log('searching');
        console.log(data);
        if (response.status === 200) setSlideRows(data);
    }

    async function getWatchList(){
      
      try {
        const response = await fetch('http://localhost:5000/api/profiles/watchlist/get', {
          method: 'POST',
          headers: {
                'Content-Type' : 'application/json',
          },
          body: JSON.stringify({
            EMAIL: auth.email,
            PROFILE_ID : auth.profile
          })
        });

        const responseData = await response.json();
        // console.log(responseData);

        if (responseData.arr) setSlideRows(responseData.arr);
      } catch (err){
          console.log(err);
      }
      

    }

    async function getSuggestions(event){
      const response = await fetch('http://localhost:5000/api/browse/suggestions');
      const responseData = await response.json();
      console.log('Getting response data. . .');
      setSlideRows(responseData);
    }

    useEffect(() => {
      setTimeout(() => {
        setLoading(false);
      }, 300);
      auth.profile = profile.PROFILE_ID;
      getLastWatched();
      // console.log('Auth.profile_id = ' + auth.profile);
    }, [profile.PROFILE_ID]);

    async function getLastWatched(){
      if (category === 'films'){
        const response = await fetch(`http://localhost:5000/api/profiles/movie/continue/?profile_id=${profile.PROFILE_ID}&email=${auth.email}`);
        const responseData = await response.json();
        console.log(responseData);
        if (slides[category][0].title !== 'Continue Watching') slides[category].unshift(responseData);
        slides[category][0] = responseData;
      } else if (category === 'series'){
        const response = await fetch(`http://localhost:5000/api/profiles/show/continue/?profile_id=${profile.PROFILE_ID}&email=${auth.email}`);
        const responseData = await response.json();
        console.log(responseData);
        if (slides[category][0].title !== 'Continue Watching') slides[category].unshift(responseData);
        slides[category][0] = responseData;
      }
    }

    useEffect(() => {
      console.log(slides);
      

      if (category === 'films' || category === 'series'){
        setSlideRows(slides[category]);
      }
      
      getLastWatched();

      if (category === 'watchlist'){
        getWatchList();
      }
    }, [category, profile.PROFILE_ID]);

    

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

         <Header  dontShowOnSmallViewPort>
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
              
              <Header.TextLink active={category === 'watchlist' ? 'true' : 'false'} onClick={() => setCategory('watchlist')}>
                WatchList
              </Header.TextLink>

              <Header.TextLink active={category === 'suggestions' ? 'true' : 'false'} onClick={(event) => {
                setCategory('suggestions');
                getSuggestions(event);
                }}>
                Suggestions
              </Header.TextLink>

            </Header.Group>
            
            
            <Header.Group>

            {/* <Header.Select className = "mt-4 col-md-8 col-offset-4" width = '100px' options = {options} styles = {customStyles}> </Header.Select> */}

            


              <Header.Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
              <Header.Profile>
                
                <Header.Picture src = {'2'}/>
                
                <Header.Dropdown>

                  <Header.Group>
                    <Header.Picture src = {'2'}/>
                    <Header.TextLink> {profile.PROFILE_ID} </Header.TextLink>
                  </Header.Group>

                  {/* <Header.Group>
                    <Header.TextLink onClick = { () => history.push(ROUTES.ADD_SUBSCRIPTION)}> Subscription </Header.TextLink>
                  </Header.Group> */}
                  <Header.Group>
                    <Header.TextLink onClick = { () => history.push(ROUTES.ACCOUNT_SETTINGS)}> Settings </Header.TextLink>
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

          {/* {(category === 'films' || category === 'series' )&& <Header.Feature>
            <Header.FeatureCallOut>Watch Joker Now</Header.FeatureCallOut>
            <Header.Text>
              Forever alone in a crowd, failed comedian Arthur Fleck seeks connection as he walks the streets of Gotham
              City. Arthur wears two masks -- the one he paints for his day job as a clown, and the guise he projects in a
              futile attempt to feel like he's part of the world around him.
            </Header.Text>
            <Header.PlayButton> Play </Header.PlayButton>
          </Header.Feature>
          } */}

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

                    {category === 'episodes' && <Card.SubTitle> 
                      {'Season ' + item.SEASON_NO + ' Episode ' + item.EPISODE_NO}
                      </Card.SubTitle>}

                    {/* <Card.Text>{item.DESCRIPTION}</Card.Text> */}
                    <Card.Text> {item.RATING}</Card.Text>
                  </Card.Meta>
                </Card.Item>
              ))}
            </Card.Entities>
            <Card.Feature category = {category} setCategory = {setCategory} setSlideRows = {setSlideRows}>
                
                
            </Card.Feature>
            </Card>
            ))}
        </Card.Group>
      
        <FooterContainer />
      </>
    
    ) : (
      <> <SelectProfileContainer email = {auth.email} setProfile = {setProfile} setCategory = {setCategory}/> </>
    );
}