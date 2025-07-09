
import Social from "../../components/common/Social";

const Footer = () => {
  return (
    <footer className="footer__area footer__area-two">
      <div className="container footer__content">
        <div className="footer__left">
          <img src="/assets/teamwill.webp" alt="Footer Logo" style={{ maxWidth: "500px", marginBottom: "30px", display: "block"}} />
        </div>
        <div className="footer__right">
          <h4 className="footer__widget-title">Our Socials</h4>
          <ul className="list-wrap footer__social">
            <Social />
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;