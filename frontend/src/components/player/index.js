import React, { useState, useContext, createContext } from 'react';
import ReactDOM from 'react-dom';
import { Container, Button, Overlay, Inner, Close } from './styles/player';
import VideoPlayer from 'react-video-js-player';
import ReactPlayer from 'react-player';
import {AuthContext} from './../../context/auth-context';
export const PlayerContext = createContext();

export default function Player({ children, ...restProps }) {
  const [showPlayer, setShowPlayer] = useState(false);

  return (
    <PlayerContext.Provider value={{ showPlayer, setShowPlayer }}>
      <Container {...restProps}>{children}</Container>
    </PlayerContext.Provider>
  );
}

Player.Video = function PlayerVideo({ src, itemFeature, ...restProps }) {
  const { showPlayer, setShowPlayer } = useContext(PlayerContext);
  const ref = React.createRef();
  const auth = useContext(AuthContext);

  async function saveTime (event){
    console.log('Paused');
    const time = ref.current.getCurrentTime();
    
    const response = await fetch('http://localhost:5000/api/profiles/movie/time/set', {
        method: 'POST',
        headers: {
              'Content-Type' : 'application/json',
        },
        body: JSON.stringify({
          email: auth.email,
          profile_id : auth.profile,
          movie_id: itemFeature.MOVIE_ID,
          show_id : itemFeature.SHOW_ID,
          watched_upto : time
        })
    });


    const responseData = await response.json();
    console.log(responseData);
    
  }

  async function getTime (event){
    
    try{
      const response = await fetch(`http://localhost:5000/api/profiles/movie/time/get/?email=${auth.email}&profile_id=${auth.profile}&movie_id=${itemFeature.MOVIE_ID}`);
      const responseData = await response.json();
      if (response.status === 200) ref.current.seekTo(responseData.WATCHED_UPTO, 'seconds');
    } catch(err){
      console.log(err);
    }
    
    
    
  }
  return showPlayer
    ? ReactDOM.createPortal(
        <Overlay onClick={() => setShowPlayer(false)} data-testid="player">
          <Inner>
            <ReactPlayer
            ref = {ref} 
            controls
            url = 'http://server2.ftpbd.net/FTP-2/English%20Movies/IMDB%20TOP%20250/004.%20The%20Dark%20Knight%20%282008%29%20720p%20%5BDual%20Audio%5D%5BEnglish%2BHindi%5D/The%20Dark%20Knight%20%282008%29%20BRrip%20720p%20x264%20Dual%20Audio%20%5BEng-Hindi%20%5D.mkv' 
            onPause = {event => saveTime(event)}
            onPlay = {event => getTime(event)}/>
            <Close />
          </Inner>
        </Overlay>,
        document.body
      )
    : null;
};

Player.Button = function PlayerButton({ ...restProps }) {
  const { showPlayer, setShowPlayer } = useContext(PlayerContext);

  return (
    <Button onClick={() => setShowPlayer((showPlayer) => !showPlayer)} {...restProps}>
      Play
    </Button>
  );
};
