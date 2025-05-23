import "./App.css";
import useRouteElement from "./useRouteElement";
import ChatboxAI from "./components/Chat/ChatboxAI";

function App() {
  const routeElement = useRouteElement();
  return (
      <>
        <div style={{ backgroundColor: "#f4f4f4" }}>{routeElement}</div>
        <ChatboxAI />
      </>
  );
}

export default App;
