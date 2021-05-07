import { memo, useState } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Diff from "text-diff";
import "./DiffSection.css";

const gradientOverlayHtml = `
<div style="
	position: sticky;
	width: 100%;
	height: 5em;
	textAlign: center;
	background: linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, white 90%);
	left: 0;
	bottom: -1px;
	zIndex: 1;
"></div>
`;

function DiffSection(props) {
	const { beforeText, afterText } = props;
	const [isSectionExpanded, setSectionExpanded] = useState(false);

	const diff = new Diff();
	const textDiff = diff.main(beforeText, afterText);
	const diffHtml = diff.prettyHtml(textDiff).replaceAll(/<br\s*\/>/g, "");
	const wrappedDiffHtml = `<pre style="white-space: pre-wrap;">${diffHtml}</pre>`;

	return (
		<Container>
			<Row>
				<Col>
					<h6>Text Diff</h6>
				</Col>
			</Row>
			<Row>
				<Col>
					<div
						className="diff-section"
						dangerouslySetInnerHTML={{
							__html: wrappedDiffHtml + (isSectionExpanded ? "" : gradientOverlayHtml),
						}}
						style={{
							height: isSectionExpanded ? "20em" : "10em",
							overflowY: isSectionExpanded ? "auto" : "hidden",
						}}
					></div>
					{!isSectionExpanded && (
						<Button
							variant="light"
							size="sm"
							block
							onClick={() => setSectionExpanded(true)}
							style={{ color: "#546e7a", fontWeight: "bold" }}
						>
							Click to expand
						</Button>
					)}
				</Col>
			</Row>
		</Container>
	);
}

const memoComponent = memo(
	DiffSection,
	(prev, next) => prev.beforeText === next.beforeText && prev.afterText === next.afterText
);
export default memoComponent;
export { memoComponent as DiffSection };
