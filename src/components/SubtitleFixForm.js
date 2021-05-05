import { memo, useState } from "react";
import Jumbotron from "react-bootstrap/Jumbotron";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Button from "react-bootstrap/Button";
import axios from "axios";
import FileSaver from "file-saver";
import moment from "moment";
import sha256 from "crypto-js/sha256";
import Base64 from "crypto-js/enc-base64";
import { backendHost } from "../backendConfig";

const isInteger = (e) => {
	const num = Number(e);
	return num === 0 || num > 0 || num < 0;
};

const getFormattedDateTime = () => moment().utc().format("YYYY-MM-DD HH:mm");
const getSessionKey = (salt) => Base64.stringify(sha256(getFormattedDateTime() + "_" + salt));

function SubtitleFixForm() {
	const [isLoading, setLoading] = useState(false);
	const [data, setData] = useState({
		sortByTime: true,
		correctSeqNums: true,
		keepFirstLine: false,
		singleLine: true,
		chineseTranslation: "TC",
		adjustTime: 0,
		expandOrShrinkDuration: 0,
	});

	const handleOnChange = (k, v) => setData((state) => ({ ...state, [k]: v }));

	const postSubtitleFix = () => {
		setLoading(true);

		const formData = new FormData();

		for (const k in data) {
			formData.append(k, data[k]);
		}

		console.log(getFormattedDateTime());
		console.log(getSessionKey(data.srtFile.name));
		formData.append("sessionKey", getSessionKey(data.srtFile.name));

		axios.post(`${backendHost}/subtitle/fix`, formData).then((response) => {
			if (response && response.data && response.data.srtFileContent) {
				const blob = new Blob([response.data.srtFileContent], { type: "text/plain;charset=utf-8" });
				FileSaver.saveAs(blob, "hello world.txt");

				setLoading(false);
			} else {
				setLoading(false);
			}
		});
	};

	return (
		<Jumbotron>
			<h2>Welcome to SRT Subtitle Fixer!</h2>

			<div style={{ padding: "20px" }} />

			<Form action="/test">
				<Form.Group>
					<Form.File
						custom
						id="srtFile"
						label={(data.srtFile && data.srtFile.name) || "Select SRT file…"}
						onChange={(e) => handleOnChange(e.target.id, e.target.files[0])}
					/>
				</Form.Group>

				<Form.Group>
					<Form.Check
						custom
						inline
						label="Traditional Chinese"
						type="radio"
						name="chineseTranslation"
						id="TC"
						onChange={(e) => handleOnChange(e.target.name, e.target.id)}
						defaultChecked
					/>
					<Form.Check
						custom
						inline
						label="Simplified Chinese"
						type="radio"
						name="chineseTranslation"
						id="SC"
						onChange={(e) => handleOnChange(e.target.name, e.target.id)}
					/>
					<Form.Check
						custom
						type="checkbox"
						id="sortByTime"
						label="Sort by time"
						onChange={(e) => handleOnChange(e.target.id, e.target.checked)}
						defaultChecked
					/>
					<Form.Check
						custom
						type="checkbox"
						id="correctSeqNums"
						label="Correct sequence numbers"
						onChange={(e) => handleOnChange(e.target.id, e.target.checked)}
						defaultChecked
					/>
					<Form.Check
						custom
						type="checkbox"
						id="keepFirstLine"
						label="Keep only the first subtitle line"
						onChange={(e) => handleOnChange(e.target.id, e.target.checked)}
					/>
					<Form.Check
						custom
						type="checkbox"
						id="singleLine"
						label="Combine multi-line subtitles into single line"
						onChange={(e) => handleOnChange(e.target.id, e.target.checked)}
						defaultChecked
					/>
				</Form.Group>

				<Form.Group as={Row}>
					<Form.Label column sm={3}>
						Adjust time (ms):
					</Form.Label>
					<Col>
						<Form.Control
							type="text"
							id="adjustTime"
							value={data.adjustTime}
							onChange={(e) => handleOnChange(e.target.id, e.target.value)}
							onBlur={(e) => {
								if (isInteger(e.target.value)) {
									setData((state) => ({ ...state, [e.target.id]: Number(data[e.target.id]) }));
								} else {
									setData((state) => ({ ...state, [e.target.id]: 0 }));
								}
							}}
						/>
					</Col>
				</Form.Group>

				<Form.Group as={Row}>
					<Form.Label column sm={3}>
						Expand/shrink duration (ms):
					</Form.Label>
					<Col>
						<Form.Control
							type="text"
							id="expandOrShrinkDuration"
							value={data.expandOrShrinkDuration}
							onChange={(e) => handleOnChange(e.target.id, e.target.value)}
							onBlur={(e) => {
								if (isInteger(e.target.value)) {
									setData((state) => ({ ...state, [e.target.id]: Number(data[e.target.id]) }));
								} else {
									setData((state) => ({ ...state, [e.target.id]: 0 }));
								}
							}}
						/>
					</Col>
				</Form.Group>

				<hr />

				<Button
					variant="primary"
					disabled={!data.srtFile || isLoading}
					onClick={isLoading ? null : postSubtitleFix}
				>
					{isLoading ? "Processing…" : "Submit"}
				</Button>
			</Form>
		</Jumbotron>
	);
}

const memoComponent = memo(SubtitleFixForm, (prev, next) => true);
export default memoComponent;
export { memoComponent as SubtitleFixForm };
