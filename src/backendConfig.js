const backendHost =
	process.env.NODE_ENV === "production" ? "https://srt-subtitle-fixer.herokuapp.com" : "http://localhost:8080";

const exports = { backendHost };
export default exports;
export { backendHost };
