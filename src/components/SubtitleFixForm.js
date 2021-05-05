import { memo, useState } from "react";
import Jumbotron from "react-bootstrap/Jumbotron";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
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
	const [warnMsgs, setWarnMsgs] = useState([]);
	const [errorMsgs, setErrorMsgs] = useState([]);
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
		setWarnMsgs([]);
		setErrorMsgs([]);
		setLoading(true);

		const formData = new FormData();

		for (const k in data) {
			formData.append(k, data[k]);
		}

		formData.append("sessionKey", getSessionKey(data.srtFile.name));

		axios
			.post(`${backendHost}/subtitle/fix`, formData)
			.then((res) => {
				if (res && res.data) {
					if (res.data.status !== "SUCCESS") {
						setWarnMsgs(res.data.warnMsgs);
						setErrorMsgs(res.data.errorMsgs);
					}

					if (res.data.srtFileContent) {
						const blob = new Blob([res.data.srtFileContent], { type: "text/plain;charset=utf-8" });
						FileSaver.saveAs(blob, "hello world.txt");
					}
				}

				setLoading(false);
			})
			.catch((err) => {
				setErrorMsgs(["Failed to connect to the back-end server."]);
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
						checked={data.chineseTranslation === "TC"}
					/>
					<Form.Check
						custom
						inline
						label="Simplified Chinese"
						type="radio"
						name="chineseTranslation"
						id="SC"
						onChange={(e) => handleOnChange(e.target.name, e.target.id)}
						checked={data.chineseTranslation === "SC"}
					/>
					<Form.Check
						custom
						type="checkbox"
						id="sortByTime"
						label="Sort by time"
						onChange={(e) => handleOnChange(e.target.id, e.target.checked)}
						checked={data.sortByTime}
					/>
					<Form.Check
						custom
						type="checkbox"
						id="correctSeqNums"
						label="Correct sequence numbers"
						onChange={(e) => handleOnChange(e.target.id, e.target.checked)}
						checked={data.correctSeqNums}
					/>
					<Form.Check
						custom
						type="checkbox"
						id="keepFirstLine"
						label="Keep only the first subtitle line"
						onChange={(e) => {
							handleOnChange(e.target.id, e.target.checked);

							if (e.target.checked) {
								setData((state) => ({ ...state, singleLine: false }));
							}
						}}
						checked={data.keepFirstLine}
					/>
					<Form.Check
						custom
						type="checkbox"
						id="singleLine"
						label="Combine multi-line subtitles into single line"
						onChange={(e) => {
							if (data.keepFirstLine) {
								e.preventDefault();
							} else {
								handleOnChange(e.target.id, e.target.checked);
							}
						}}
						disabled={data.keepFirstLine}
						checked={data.singleLine}
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

				<Form.Group>
					<Button
						variant="primary"
						disabled={!data.srtFile || isLoading}
						onClick={isLoading ? null : postSubtitleFix}
					>
						{isLoading ? "Processing…" : "Submit"}
					</Button>
				</Form.Group>

				{(!warnMsgs || !warnMsgs.length) && (!errorMsgs || !errorMsgs.length) ? (
					<Form.Group>
						<Alert variant="success">All good!</Alert>
					</Form.Group>
				) : null}

				{warnMsgs && warnMsgs.length ? (
					<Form.Group>
						<Alert variant="warning">{warnMsgs}</Alert>
					</Form.Group>
				) : null}

				{errorMsgs && errorMsgs.length ? (
					<Form.Group>
						<Alert variant="danger">{errorMsgs}</Alert>
					</Form.Group>
				) : null}
			</Form>
		</Jumbotron>
	);
}

const memoComponent = memo(SubtitleFixForm, (prev, next) => true);
export default memoComponent;
export { memoComponent as SubtitleFixForm };
