import React from 'react';
import { Card } from 'react-bootstrap';

import './SidebarStyle.scss';
import arrowImg from './images/Frame2.png';
import profile1Img from './images/Group49.png';
import profile2Img from './images/Group50.png';
import profile3Img from './images/Group51.png';
import profile4Img from './images/Group52.png';

function Sidebar() {
	return (
		<div className="setupSideBar">
			<div className="menuStats">Stats</div>
			<div className="menuMessage">Message</div>
			<div className="setupLine" />

			<div className="msgBox1">
				<Card className="messageBox">
					<Card.Img className="msgUserImg" src={profile1Img} />
					<Card.Body>
						<Card.Text className="msgTime">Jan2,12:13pm</Card.Text>
						<Card.Title className="msgUserName">
							James Robinson
						</Card.Title>
						<Card.Img className="msgArrow" src={arrowImg} />
						<Card.Text className="userMsg">
							I need some maintenac...
						</Card.Text>
					</Card.Body>
				</Card>
			</div>

			<div className="msgBox2">
				<Card className="messageBox">
					<Card.Img className="msgUserImg" src={profile2Img} />
					<Card.Body>
						<Card.Text className="msgTime">wed,06:00pm</Card.Text>
						<Card.Title className="msgUserName">
							Eseosa Igbnoba
						</Card.Title>
						<Card.Img className="msgArrow" src={arrowImg} />
						<Card.Text className="userMsg">
							I got your email ad and...
						</Card.Text>
					</Card.Body>
				</Card>
			</div>

			<div className="msgBox3">
				<Card className="messageBox">
					<Card.Img className="msgUserImg" src={profile1Img} />
					<Card.Body>
						<Card.Text className="msgTime">Jan2,12:13pm</Card.Text>
						<Card.Title className="msgUserName">
							James Robinson
						</Card.Title>
						<Card.Img className="msgArrow" src={arrowImg} />
						<Card.Text className="userMsg">
							I need some maintenac...
						</Card.Text>
					</Card.Body>
				</Card>
			</div>

			<div className="msgBox4">
				<Card className="messageBox">
					<Card.Img className="msgUserImg" src={profile3Img} />
					<Card.Body>
						<Card.Text className="msgTime">Jan2,12:13pm</Card.Text>
						<Card.Title className="msgUserName">
							Lupita Jonah
						</Card.Title>
						<Card.Img className="msgArrow" src={arrowImg} />
						<Card.Text className="userMsg">
							I need some maintenac...
						</Card.Text>
					</Card.Body>
				</Card>
			</div>

			<div className="msgBox5">
				<Card className="messageBox">
					<Card.Img className="msgUserImg" src={profile4Img} />
					<Card.Body>
						<Card.Text className="msgTime">Mar1,10:00pm</Card.Text>
						<Card.Title className="msgUserName">
							Gerrit James
						</Card.Title>
						<Card.Img className="msgArrow" src={arrowImg} />
						<Card.Text className="userMsg">
							I need some maintenac...
						</Card.Text>
					</Card.Body>
				</Card>
			</div>
		</div>
	);
}
export default Sidebar;
