import PleaseSignIn from '../components/PleaseSignIn';
import Order from '../components/Oder';


const OrderPage = (probs) => (
  <div>
    <PleaseSignIn>
      <Order id={ props.query.id } />
    </PleaseSignIn>
  </div>
);

export default OrderPage;
