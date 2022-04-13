import React, { Component, Fragment } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import firebase from 'firebase/app';
import ReactGA from 'react-ga';
import * as Sentry from '@sentry/browser';
import mixpanel from 'mixpanel-browser';
import Notifications from 'react-notify-toast';
import Tracker from '@openreplay/tracker';


// import ProtectedRoute from './Components/ProtectedRoute';
// import Login from "./Containers/Login";
// import Home from './Containers/Home';
// import HubspotCallback from './Components/HubspotCallback';
// import SlackCallback from './Components/SlackCallback';
// import GoogleCallback from './Components/GoogleCallback';

import { HubspotCallback } from './NewDesign/Components/HubspotCallback';
import { SlackCallback } from './NewDesign/Components/SlackCallback';
import { GoogleCallback } from './NewDesign/Components/GoogleCallback';
import { Login } from './NewDesign/Login/Login';
import { Home } from './NewDesign/Home';
import { ProtectedRoute } from './NewDesign/Components/ProtectedRoute';

let GOOGLE_ANALYTICS_ID = process.env.REACT_APP_GOOGLE_ANALYTICS_ID;
let MIXPANEL_ID = process.env.REACT_APP_MIXPANEL_ID;
let SENTRY_DSN = process.env.REACT_APP_SENTRY_DSN;

ReactGA.initialize(GOOGLE_ANALYTICS_ID);
mixpanel.init(MIXPANEL_ID);
Sentry.init({
	dsn: SENTRY_DSN,
	environment: process.env.REACT_APP_NODE_ENV,
});

const projectKey = process.env.REACT_APP_OPENREPLAY_PROJECT_KEY;
let tracker;
if (projectKey) {
	tracker = new Tracker({
		projectKey,
		ingestPoint: "https://openreplay.xtendify.com/ingest",
		__DISABLE_SECURE_MODE: true,
		onStart: ({ sessionToken }) => {
			Sentry.setTag("openReplaySessionToken", sessionToken);
		},
	});
	tracker.start();
}

class Root extends Component {
	constructor() {
		super();
		this.state = {
			authenticated: false,
			firebaseListenerRegistered: false,
		};
	}

	componentDidMount() {
		if (tracker)
			tracker.setMetadata('source', 'client');
		firebase.auth().onAuthStateChanged((user) => {
			if (user) {
				if (tracker)
					tracker.setUserID(user.email);
				this.setState({
					firebaseListenerRegistered: true,
					authenticated: true,
				});
			} else {
				this.setState({
					firebaseListenerRegistered: true,
					authenticated: false,
				});
			}
		});
	}

	render() {
		if (!this.state.firebaseListenerRegistered) {
			return null;
		}

		return (
			<Fragment>
				<Notifications />
				<BrowserRouter>
					<Switch>
						<Route exact path="/login" component={Login} />
						<ProtectedRoute
							path="/slackcallback"
							exact
							component={SlackCallback}
						/>
						<ProtectedRoute
							exact
							path="/hubspotcallback"
							component={HubspotCallback}
						/>
						<ProtectedRoute
							path="/googlecallback"
							exact
							component={GoogleCallback}
						/>
						{/* <ProtectedRoute path="/old" component={Home} /> */}
						<ProtectedRoute component={Home} />
					</Switch>
				</BrowserRouter>
			</Fragment>
		);
	}
}

export default Root;
