import { memo } from "react";
import preval from "preval.macro";
import GitInfo from "react-git-info/macro";
import moment from "moment";

function SiteFooter(props) {
	const currentYear = new Date().getFullYear();
	const lastUpdatedTime = preval`module.exports = new Date().getTime();`;
	const gitInfo = GitInfo();

	return (
		<div
			className="site-footer"
			style={{
				color: "#607d8b",
				textAlign: "center",
			}}
		>
			<div>Copyright © {currentYear} Chung Cheuk Hang Michael. All rights reserved.</div>
			Last Updated On:{" "}
			<span title={moment(lastUpdatedTime).format("D MMM YYYY HH:mm:ss")} style={{ cursor: "help" }}>
				{moment(lastUpdatedTime).format("D MMM YYYY")}
			</span>{" "}
			/{" "}
			<span title={gitInfo.commit.hash} style={{ cursor: "help" }}>
				{gitInfo.commit.shortHash}
			</span>
		</div>
	);
}

const memoComponent = memo(SiteFooter, (prev, next) => true);
export default memoComponent;
export { memoComponent as SiteFooter };
