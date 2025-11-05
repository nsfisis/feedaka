import { Redirect, Route, Switch } from "wouter";
import { Layout, ProtectedRoute } from "./components";
import {
	Login,
	NotFound,
	ReadArticles,
	Settings,
	UnreadArticles,
} from "./pages";

function App() {
	return (
		<Switch>
			<Route path="/login" component={Login} />
			<Route path="*">
				<ProtectedRoute>
					<Layout>
						<Switch>
							<Route path="/" component={() => <Redirect to="/unread" />} />
							<Route path="/unread" component={UnreadArticles} />
							<Route path="/read" component={ReadArticles} />
							<Route path="/settings" component={Settings} />
							<Route component={NotFound} />
						</Switch>
					</Layout>
				</ProtectedRoute>
			</Route>
		</Switch>
	);
}

export default App;
