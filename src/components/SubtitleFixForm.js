import { memo, useState } from "react";
import Jumbotron from "react-bootstrap/Jumbotron";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import Alert from "react-bootstrap/Alert";
import Container from "react-bootstrap/Container";
import axios from "axios";
import FileSaver from "file-saver";
import moment from "moment";
import sha256 from "crypto-js/sha256";
import Base64 from "crypto-js/enc-base64";
import { backendHost } from "../backendConfig";
import { DiffSection } from "./DiffSection";
import SiteLogo from "../logo.svg";

const MAX_FILE_SIZE_BYTE = 1024 * 1024;

const isInteger = (e) => {
	const num = Number(e);
	return num === 0 || num > 0 || num < 0;
};

const getFormattedDateTime = () => moment().utc().format("YYYY-MM-DD HH:mm");
const getSessionKey = (salt) => Base64.stringify(sha256(getFormattedDateTime() + "_" + salt));

function SubtitleFixForm(props) {
	const [isRunAtLeastOnce, setRunAtLeastOnce] = useState(false);
	const [isLoading, setLoading] = useState(false);
	const [warnMsgs, setWarnMsgs] = useState([]);
	const [errorMsgs, setErrorMsgs] = useState([]);
	const [fileName, setFileName] = useState("");
	const [beforeText, setBeforeText] = useState("");
	const [afterText, setAfterText] = useState("");
	const [isWarnMsgsExpanded, setWarnMsgsExpanded] = useState(false);
	const [data, setData] = useState({
		sortByTime: true,
		removeFormatting: true,
		correctSeqNums: true,
		keepFirstLine: false,
		singleLine: true,
		chineseTranslation: "TC",
		adjustTime: 0,
		expandOrShrinkDuration: 0,
	});

	const handleOnChange = (k, v) => setData((state) => ({ ...state, [k]: v }));

	const constructFormData = () => {
		const formData = new FormData();

		for (const k in data) {
			formData.append(k, data[k]);
		}

		formData.append("sessionKey", getSessionKey(data.srtFile.name));

		return formData;
	};

	const makeApiCall = () => {
		axios
			.post(`${backendHost}/subtitle/fix`, constructFormData())
			.then((res) => {
				if (res && res.data) {
					if (res.data.status !== "SUCCESS") {
						setWarnMsgs(res.data.warnMsgs);
						setErrorMsgs(res.data.errorMsgs);
					}

					const srtResultContent = res.data.srtFileContent;

					if (srtResultContent) {
						const blob = new Blob([srtResultContent], { type: "text/plain;charset=utf-8" });
						FileSaver.saveAs(blob, fileName);

						setAfterText(srtResultContent);
					}
				}
			})
			.catch((err) => {
				setErrorMsgs(["Network error."]);
			})
			.finally(() => {
				setLoading(false);
				setRunAtLeastOnce(true);
				setWarnMsgsExpanded(false);
				setData((state) => ({ ...state, srtFile: null }));
			});
	};

	const postSubtitleFix = () => {
		setWarnMsgs([]);
		setErrorMsgs([]);
		setLoading(true);
		setAfterText("");

		const reader = new FileReader();
		reader.onloadend = (e) => {
			const inputFileContent = e.target.result;
			const inputFileName = data.srtFile.name;
			const inputFileSize = data.srtFile.size;

			if (inputFileContent && inputFileSize <= MAX_FILE_SIZE_BYTE) {
				setBeforeText(inputFileContent);
				makeApiCall();
			} else {
				setLoading(false);
				setRunAtLeastOnce(true);
				setData((state) => ({ ...state, srtFile: null }));
				setErrorMsgs([
					inputFileContent
						? `The size of the "${inputFileName}" is ${inputFileSize} Bytes which exceeds the limit of 1MB.`
						: `Failed to read "${inputFileName}". ${
								e.target.error ? e.target.error.message : "Please make sure your file is not empty."
						  }`,
				]);
			}
		};
		reader.readAsText(data.srtFile);
	};

	return (
		<Jumbotron style={{ boxShadow: "0 0 1em rgba(0, 0, 0, 0.25)" }}>
			<Container>
				<Row>
					<Col>
						<img
							src={SiteLogo}
							alt="logo"
							draggable={false}
							onContextMenu={(e) => e.preventDefault()}
							style={{
								display: "inline-flex",
								height: "3.5em",
								verticalAlign: "middle",
								marginRight: "20px",
							}}
						/>
						<h2
							style={{
								display: "inline-flex",
								margin: "0",
								verticalAlign: "middle",
							}}
						>
							Welcome to SRT Subtitle Fixer!
						</h2>
					</Col>
				</Row>

				<div style={{ padding: "20px" }} />

				<Row>
					<Col>
						<Form>
							<Form.Group>
								<Form.File
									custom
									id="srtFile"
									accept=".ass, .srt"
									label={(data.srtFile && data.srtFile.name) || "Select ASS/SRT file…"}
									disabled={isLoading}
									onClick={(e) => (e.target.value = null)}
									onDragOver={(e) => (e.target.value = null)}
									onChange={(e) => {
										const file = e.target.files[0];

										handleOnChange(e.target.id, file);
										setFileName(file.name);
										setAfterText("");
									}}
								/>
							</Form.Group>

							<p style={{ color: "#78909c" }}>
								Note: If the file is in ASS format, it will be automatically converted into SRT.
							</p>

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
									disabled={isLoading}
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
									disabled={isLoading}
								/>
								<Form.Check
									custom
									type="checkbox"
									id="sortByTime"
									label="Sort by time"
									onChange={(e) => handleOnChange(e.target.id, e.target.checked)}
									checked={data.sortByTime}
									disabled={isLoading}
								/>
								<Form.Check
									custom
									type="checkbox"
									id="removeFormatting"
									label="Remove formatting"
									onChange={(e) => handleOnChange(e.target.id, e.target.checked)}
									checked={data.removeFormatting}
									disabled={isLoading}
								/>
								<Form.Check
									custom
									type="checkbox"
									id="correctSeqNums"
									label="Correct sequence numbers"
									onChange={(e) => handleOnChange(e.target.id, e.target.checked)}
									checked={data.correctSeqNums}
									disabled={isLoading}
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
									disabled={isLoading}
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
									disabled={isLoading || data.keepFirstLine}
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
												setData((state) => ({
													...state,
													[e.target.id]: Number(data[e.target.id]),
												}));
											} else {
												setData((state) => ({ ...state, [e.target.id]: 0 }));
											}
										}}
										disabled={isLoading}
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
												setData((state) => ({
													...state,
													[e.target.id]: Number(data[e.target.id]),
												}));
											} else {
												setData((state) => ({ ...state, [e.target.id]: 0 }));
											}
										}}
										disabled={isLoading}
									/>
								</Col>
							</Form.Group>

							<Form.Group>
								<Button
									variant="dark"
									disabled={isLoading || !data.srtFile}
									onClick={isLoading ? null : postSubtitleFix}
								>
									{isLoading ? "Processing…" : "Start"}
								</Button>
								{isLoading && (
									<Spinner
										animation="border"
										variant="secondary"
										size="sm"
										style={{ verticalAlign: "middle", marginLeft: "1em" }}
									/>
								)}
							</Form.Group>

							{isRunAtLeastOnce &&
							!data.srtFile &&
							!isLoading &&
							(!warnMsgs || !warnMsgs.length) &&
							(!errorMsgs || !errorMsgs.length) ? (
								<Form.Group>
									<Alert variant="success">
										<Alert.Heading as="h6">Success</Alert.Heading>All good!
									</Alert>
								</Form.Group>
							) : null}

							{warnMsgs && warnMsgs.length && !data.srtFile ? (
								<Form.Group>
									<Alert
										variant="warning"
										style={{
											marginBottom: "0",
											height:
												isWarnMsgsExpanded && warnMsgs.length > 11
													? "20em"
													: !isWarnMsgsExpanded && warnMsgs.length > 5
													? "10em"
													: "auto",
											whiteSpace: "nowrap",
											overflowX: isWarnMsgsExpanded ? "auto" : "hidden",
											overflowY: isWarnMsgsExpanded ? "auto" : "hidden",
										}}
									>
										<Alert.Heading as="h6">Warnings ({warnMsgs.length})</Alert.Heading>
										{warnMsgs.map((msg, i) => (
											<div key={i}>{msg}</div>
										))}
										{!isWarnMsgsExpanded && warnMsgs.length > 5 && (
											<div
												style={{
													position: "absolute",
													width: "100%",
													height: "5em",
													textAlign: "center",
													background:
														"linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, white 90%)",
													left: 0,
													bottom: 0,
													zIndex: 1,
												}}
											></div>
										)}
									</Alert>
									{!isWarnMsgsExpanded && warnMsgs.length > 5 && (
										<Button
											variant="light"
											size="sm"
											block
											onClick={() => setWarnMsgsExpanded(true)}
											style={{ color: "#546e7a", fontWeight: "bold" }}
										>
											Click to expand
										</Button>
									)}
								</Form.Group>
							) : null}

							{errorMsgs && errorMsgs.length && !data.srtFile ? (
								<Form.Group>
									<Alert variant="danger">
										<Alert.Heading as="h6">Errors ({errorMsgs.length})</Alert.Heading>
										{errorMsgs.map((msg, i) => (
											<div key={i}>{msg}</div>
										))}
									</Alert>
								</Form.Group>
							) : null}
						</Form>
					</Col>
				</Row>
			</Container>

			{beforeText && afterText && <DiffSection beforeText={beforeText} afterText={afterText} />}
		</Jumbotron>
	);
}

const memoComponent = memo(SubtitleFixForm, (prev, next) => true);
export default memoComponent;
export { memoComponent as SubtitleFixForm };
