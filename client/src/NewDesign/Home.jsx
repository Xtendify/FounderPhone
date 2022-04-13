import React from 'react';
import { Switch, Route } from 'react-router';
import { Container, Row } from 'react-bootstrap';

import { LeftSidebar } from './LeftSidebar/LeftSidebar';
import { Setup } from './Setup/Setup';
import { CampaignList } from './Campaign/CampaignList';
import { NewCampaign } from './Campaign/NewCampaign';
import { Billing } from './Billing/Billing';
import { Inbox } from './Inbox/Inbox';
import './index.scss';

export const Home = (props) => {
	return (
		<Container fluid>
			<Row>
				<div className="col-xl-3 col-lg-4 col-md-6 col-sm-4 col position-fixed height100P mobile-hide-show">
					<LeftSidebar />
				</div>
				<div className="col-xl-9 col-lg-8 col-md-12 col-sm-12 col offset-xl-3 offset-lg-4">
					{/* <NotificationTop /> */}
					<Switch>
						<Route exact path="/" component={Setup} />
						<Route
							exact
							path="/campaign"
							component={CampaignList}
						/>
						<Route exact path="/contact" component={NewCampaign} />
						<Route exact path="/inbox" component={Inbox} />
						<Route exact path="/billing" component={Billing} />
					</Switch>
				</div>
			</Row>
		</Container>
	);
};
