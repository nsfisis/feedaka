import { Redirect, Route, Switch } from "wouter";
import { Layout } from "./components";
import { NotFound, ReadArticles, Settings, UnreadArticles } from "./pages";

function App() {
	return (
		<Layout>
			<Switch>
				<Route path="/" component={() => <Redirect to="/unread" />} />
				<Route path="/unread" component={UnreadArticles} />
				<Route path="/read" component={ReadArticles} />
				<Route path="/settings" component={Settings} />
				<Route component={NotFound} />
			</Switch>
		</Layout>
	);
}

export default App;
