import { SubtitleFixForm } from "./components/SubtitleFixForm";
import { SiteFooter } from "./components/SiteFooter";
import "./App.css";

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
