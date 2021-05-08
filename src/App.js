import { SubtitleFixForm } from "./components/SubtitleFixForm";
import { SiteFooter } from "./components/SiteFooter";
import "./App.css";
import "./bootstrap-form.css";

function App(props) {
	return (
		<div style={{ padding: "2.5vw 5vw" }}>
			<SubtitleFixForm />
			<SiteFooter />
		</div>
	);
}

export default App;
export { App };
