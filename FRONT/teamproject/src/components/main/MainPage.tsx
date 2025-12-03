import Planning from './Planning';
import Warning from './Warning';
import Place from './Place';
import Footer from './Footer';
import Chat from '../chatting/Chat';
import { useAuthSession } from '../../hooks/useAuthSession';

function MainPage() {
  const { isLogin } = useAuthSession();
  return (
    <>
      <Planning />
      <Warning />
      <Place />
      {isLogin ? <Chat /> : ''}
      <Footer />
    </>
  );
}

export default MainPage;