import { memo } from "react";
import { WikEdDiff } from "../wikEd-diff";

function DiffSection(props) {
	const { beforeText, afterText } = props;

	const wikEdDiff = new WikEdDiff();
	const diffHtml = wikEdDiff.diff(beforeText, afterText);

	return <div dangerouslySetInnerHTML={{ __html: diffHtml }} />;
}

const memoComponent = memo(
	DiffSection,
	(prev, next) => prev.beforeText === next.beforeText && prev.afterText === next.afterText
);
export default memoComponent;
export { memoComponent as DiffSection };
