import "./App.css";
import { SubtitleFixForm } from "./components/SubtitleFixForm";
import { SiteFooter } from "./components/SiteFooter";

function App(props) {
	return (
		<div style={{ padding: "5vw" }}>
			<SubtitleFixForm />
			<SiteFooter />
		</div>
	);
}

export default App;
export { App };
