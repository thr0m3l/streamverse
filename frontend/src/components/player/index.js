import React, { useState, useContext, createContext } from 'react';
import ReactDOM from 'react-dom';
import { Container, Button, Overlay, Inner, Close } from './styles/player';
import VideoPlayer from 'react-video-js-player';
import ReactPlayer from 'react-player';
export const PlayerContext = createContext();

export default function Player({ children, ...restProps }) {
  const [showPlayer, setShowPlayer] = useState(false);

  return (
    <PlayerContext.Provider value={{ showPlayer, setShowPlayer }}>
      <Container {...restProps}>{children}</Container>
    </PlayerContext.Provider>
  );
}

Player.Video = function PlayerVideo({ src, ...restProps }) {
  const { showPlayer, setShowPlayer } = useContext(PlayerContext);
  const ref = React.createRef();

  async function saveTime (){
    console.log('Paused');
    const time = ref.current.getCurrentTime();
    console.log(time);
  }
  return showPlayer
    ? ReactDOM.createPortal(
        <Overlay onClick={() => setShowPlayer(false)} data-testid="player">
          <Inner>
            <ReactPlayer
            ref = {ref} 
            controls
            url = 'https://www.youtube.com/watch?v=ysz5S6PUM-U' 
            onPause = {saveTime}/>
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
