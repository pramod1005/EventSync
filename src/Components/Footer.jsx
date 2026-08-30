import './Footer.css'

function Footer() {
	return (
		<footer className="footer-distributed">

			<div className="footer-left">

				<h3><span>Planova</span></h3>



				<p className="footer-company-name">Planova © 2025</p>
			</div>

			<div className="footer-center">

				<div>
					<i className="fa fa-map-marker"></i>
					<p><span style={{ lineHeight: "18px" }}>Indian Institute of Information Technology,<br />Design and Manufacturing</span> Jabalpur, Madhya Pradesh</p>
				</div>

				<div>
					<i className="fa fa-phone"></i>
					<p>+91 8885455672</p>
				</div>

				<div>
					<i className="fa fa-envelope"></i>
					<p><a href="mailto:23bcs054@iiitdmj.ac.in">support@planova.com</a></p>
				</div>

			</div>

			<div className="footer-right">

				<p className="footer-company-about">
					<span>About the company</span>
					Planova is a complete event management system that streamlines planning, registration, and attendee engagement. It features integrated payments, automated emails, and built-in chat to manage every aspect of an event seamlessly.				</p>

				<a href="https://github.com/DSurya11/Event-Management-System" target="_blank" rel="noopener noreferrer">
					<img className='footer-icons-image' src="/github.png" alt="GitHub" />
				</a>

			</div>

		</footer>
	)
}
export default Footer;
