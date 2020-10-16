import Reset from "../components/Reset";

const resetPage = (probs) => (
  <div>
    <p>Reset your Password!</p>
    <Reset resetToken={props.query.resetToken} />
  </div>
);
export default resetPage;
