import Planning from './Planning';
import Warning from './Warning';
import Place from './Place';
import Footer from './Footer';
import Chat from '../chatting/Chat';

function MainPage() {
  return (
    <>
      <Planning />
      <Warning />
      <Place />
      <Chat/>
      <Footer />
    </>
  );
}

export default MainPage;