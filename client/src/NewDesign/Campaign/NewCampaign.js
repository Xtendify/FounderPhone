import React from 'react';

import '../Components/Popup/popup.scss';
import './add-campaign.scss';
import './campaign-contacts.scss';
import '../Inbox/Inbox.scss';

import wavinghandImg from '../Setup/images/wavinghand.png';
// import filterIcon from './images/filter.svg';
// import tabAdmin from './images/user1.svg';
// import tabHistory from './images/time1.svg';
// import deletealert from './images/delete-2.svg';
// import addTag from './images/plus-1.svg';
// import closeHistory from './images/coolicon.svg';
// import selectdrop from './images/Polygon.svg';
// import updateBtn from './images/refresh.svg';
// import userIcon from './images/userAddCont.png';
import { ContactsList } from '../Components/ContactsList';
// import SVGIcon from './SVG/SvgIcons';

export const NewCampaign = () => {
	return (
		<div className="campaign-contacts">
			<div className="row">
				<div className="col-12">
					<div className="campaign-contactsUser">
						<img
							src={wavinghandImg}
							alt="hello"
							className="campaign-contactsUser-handIcon"
						/>
						<text className="campaign-contactsUser-name">Hey</text>
					</div>
				</div>
			</div>
			<div className="row">
				<ContactsList componentLoaded="newCampaign" />
			</div>

			{/* <div className={filterPopUp ? "sidebar-popup-mask" : "sidebar-popup-mask open"} type='button	'>
			<div className="sidebar-popup-content">
				<a className="close-popup" type='button' onClick={filterfn}><img src={closePopup} alt="" /></a>
				<div className="col-12">
					<div className="add-campaign-main text-start">
						<div className={filterPopUp ? "campaign-filter-box" : "campaign-filter-box open"}>
						<div className="add-campaign-inner">
							<h5 className="main-title">Filters</h5>
							<div className="widgets">
								<h6 className="inner-title">Tags</h6>
								<span className="fp-badge"><a href="" className="badge-item">Market</a></span>
								<span className="fp-badge"><a href="" className="badge-item active">Stats	</a></span>
								<span className="fp-badge"><a href="" className="badge-item">fee</a></span>
								<span className="fp-badge"><a href="" className="badge-item">Business</a></span>
							</div>
							<hr className="separator" />
							<div className="widgets">
								<h6 className="inner-title">List</h6>
								<span className="fp-badge"><a href="" className="badge-item">Known</a></span>
								<span className="fp-badge"><a href="" className="badge-item active">unknown	</a></span>
								<span className="fp-badge"><a href="" className="badge-item">Known</a></span>
								<span className="fp-badge"><a href="" className="badge-item">unknown</a></span>
							</div>
							<hr className="separator" />
							<div className="widgets">
								<h6 className="inner-title">Date</h6>
								<form className="form">
									<div className="row">
										<div className="col-md-6">
											<label className="label" forName="fp-from">
											from
											<input type="text" className="form-control" id="fp-from" name="fp-from" />
											</label>
										</div>
										<div className="col-md-6">
											<label className="label" forName="fp-to">
											to
											<input type="text" className="form-control" id="fp-to" name="fp-to" />
											</label>
										</div>
									</div>
								</form>
							</div>
							<hr className="separator" />
							<div className="widgets white-boxed">
								<h6 className="inner-title">Date</h6>
								<span className="select-all">Select All</span>
								<form className="form">
									<div className="row">
										<div className="col-12">
											<label className="label icon normal" forName="fp-search">
											<input type="search" className="form-control" id="fp-search" name="fp-search" placeholder="Search by name or number" />
											</label>
										</div>
									</div>
									<div className="row">
										<div className="col-12">
											<label className="label" forName="fp-checkbox">
											+123 456 7890
											<input type="checkbox" className="checkbox" name="fp-checkbox" checked="checked" />
											<span className="checkmark"></span>
											</label>
										</div>
									</div>
									<div className="row">
										<div className="col-12">
											<label className="label" forName="fp-checkbox">
											+123 456 7890
											<input type="checkbox" className="checkbox" name="fp-checkbox" />
											<span className="checkmark"></span>
											</label>
										</div>
									</div>
									<div className="row">
										<div className="col-12">
											<label className="label" forName="fp-checkbox">
											+123 456 7890
											<input type="checkbox" className="checkbox" name="fp-checkbox" />
											<span className="checkmark"></span>
											</label>
										</div>
									</div>
									<div className="row">
										<div className="col-md-6">
											<button className="btn--primaryRed fullwidth marT30"> Cancel</button>
										</div>
										<div className="col-md-6">
											<button className="btn--primaryGreen fullwidth marT30">Apply </button>
										</div>
									</div>
								</form>
							</div>
						</div>
					</div>
				</div>
			</div>
			</div>
			</div> */}
		</div>
	);
};
